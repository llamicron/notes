# L7 - More on Assembly and Registers
Luke Sweeney

CSE 2312

Dr. Losh

UT Arlington

Feb 9, 2021

# Registers
There are about 30 registers, usable by the ALU. The ALU uses registers as arguments and to store results. Memory holds our data.

Say we have some variables in memory (`x`, `y`, `z`). We need to move them into registers so the ALU can use them. Then we want to calculate `z = x + y`.

1. `mov` x into reg 0 (load)
2. `mov` y into reg 1 (load)
3. Add reg 0 + reg 1 -> reg 2
4. Reg 2 -> z (store)

Reading from memory is "loading", writing to memory is "storing". This process is the "load-store" process.

```
(load)
mem x -> reg 0
                \                 (store)
                 + (ALU) -> reg 2 ------> mem z
                /
mem y -> reg 1
(load)
```

## Byte sizes
```
// kilobytes
1kB = 1000 bytes
// megabytes
1MB = 10^6 bytes
// gigabytes
1GB = 10^9 bytes

// kilobytes (notice the capital)
1 KiB = 2^10 bytes
1 MiB = 2^20 bytes
1 GiB = 2^30 bytes
4 Gib = 2^32 bytes
```

In memory, say we have `4 Gib`. Data can be written and read from memory.

```
               +-------------------+
               |                   |
               |     memory        |
               |                   |
               |      2^32         |
               |      bytes        |
               |                   |
  Address ==/=>|      4 GiB        |<=/=> data
               |                   | 32 bits
               |                   | 4 bytes/words
               |      2^30         |
               |      words        |
               |                   |
               |                   |
               |                   |
               |                   |
               +-------------------+
```




Memory interfaces with a `mux` that selects which register to read from/write to.

```
               Load-Store architecture
               -----------------------

               +--------------------+     
               |                    |     
               |       memory       |     
               |                    |               +---------------+    +----------+
               |                    |  write/store  |               | => |    R0    |
               |                    |<==============|      mux      |    +----------+
               |                    |               |               |     
               |                    |    (data)     |               |    +----------+
  Address ==/=>|                    |<======/======>|               |    |    R1    |
               |                    |               |               |    +----------+
               |                    |  read/load    |               |        ...
               |                    |==============>|               |    +----------+
               |                    |               |               |    |    R15   |
               |                    |               |               |    +----------+
               |                    |               |               |
               |                    |               +---------------+
               |                    |                    |
               |                    |         selects 1 of 16 registers
               +--------------------+     
```



Addresses of variables are stored in registers, which the mux selects.

## Assembly Commands

| `cmd` | description |
| ----- | ------------|
| `LDR` | load register (from memory) |
| `STR` | store register (to memory) |

### `LDR` Example
```s
LDR R0, [R1]
```
This says "load a 32-bit integer from memory at address `R1` and store it's value in `R0`.

The square brackets `[x]` means "the contents of the memory at address x". It's a bit like `*`dereferencing in `C`.

Here's how to access an array element with assembly
```c
uint8_t x[100]; // 100 element array
uint8_t y, i;

y = x[i];
```
```s
# This is psuedocode
# R1 gets the address of the first element of the array
R1 = &x[0]
R2 = i
R0 <- [R1 + R2]
# R0 now has the address of x[i] (y)
```

### `STR` Example
`STR` works the other way

```s
STR R0, [R1]
```
This stores a 32-bit integer into `R1` (I think he may have the `[]` wrong, I think they should go around `R0` but I'm not sure).


```s
# Psuedocode
uint8_t x, y, z;
z = x + y;

# R0 gets the memory addr of x (which we made up)
R0 = &x = 0x2000 0000
R1 = &y = 0x2000 0004
R2 = &z = 0x2000 0008

# R3 <- R0
# load the value from addr R0 into R3
LDR R3, [R0]
# R4 <- R1
# load the value from addr R1 into R4
LDR R4, [R1]

# R5 <- x + y
# value of x + y into R5
ADD R5, R3, R4
# z <- R5 = x + y
# Store value from R5 into R2, which points to z
STR R5, [R2]
```

# Control Flow
When calling a function from C, the function will be executed and then control will return to the caller

```c
void fn()
{ // fn starts
  // fn runs
} // fn ends and returns

int main(void)
{
    // When calling this function, control flow passes to the function
    fn();
    // then is returned here after the function returns.
}
```

`R15` is a special register called the "PC" or "program counter". It contains the address of the next instruction to execute. `R14` is called a "link register".

```s
# This memory points to some instruction
0x1000 0000: ADD


# BL (branch-link) sets R15 (next instr) to the first instruction of fn()
# it "branches" off and the function returns to the next instr
# This will store a link (in R14) for the next instr (0008)

# After BL fn runs,   R14 = 0x1000 0008
#                     R15 = 0x2000 0000 (fn())                    
0x1000 0004: BL fn
0x1000 0008: ...

-----------
fn()
{
    # instructions here     addr: 0x2000 0000
    # more...               addr: 0x2000 0004
    #                       addr: ...........
    # finally return        addr: 0x2000    N

    # This command means PC <- LR (link register, R14)
    # R14 is still 0x1000 0008
    # We load that into PC so it returns to the next isntr after this fn()
    # This is like "return"
    BX LR
}
```

You can also say 
```s
B fn
```
which means "branch", with no link. You are not able to return from `fn` because there is no link back (`R14`).
