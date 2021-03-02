# L8 - More assembly and how C calls a symbol

| Feb 12, 2021 | CSE 2312 | Dr. Losh | UT Arlington | Luke Sweeney |
| ------------ | -------- | -------- | ------------ | ------------ | 

# How C calls a symbol

Here's the program we're talking about

```c
// add32.c
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>

extern int32_t addS32(int32_t x, int32_t y);
extern uint32_t addU32(uint32_t x, uint32_t y);

int main() {
    int32_t a, b, c;
    a = 100;
    b = -200;
    c = addS32(a, b);
    printf("a + b = %d + %d = %d\n", a, b, c);

    uint32_t d, e, f;
    d = 100;
    e = 200;
    f = addU32(d, e);
    printf("d + e = %d + %d = %d\n", d, e, f);
    
    return EXIT_SUCCESS;
}
```

```s
// add32.s
.global addS32
.global addU32

.text

// R0 = x, R1 = y, return x+y in R0
addU32:
    ADD R0, R0, R1  // R0 <= R0 + R1
    BX LR           // return to caller

// R0 = x, R1 = y, return x+y in R0
addS32:
    ADD R0, R0, R1  // R0 <= R0 + R1
    BX LR           // return to caller
```

The `extern` keyword in C tells the C compiler that the symbol (`addU32` and `addS32`) is not located in the compiled object (`add32.o`), but somewhere else. Instead, we provide the function signature only. Later, when we compile from `*.o` into an executable, we will "link" the compiled `add32.s` file, which provides a definition for the two functions. The "linker" is responsible for linking symbols like this.

You add the `*.s` file like this

```
gcc -o add32 add32.c add32.s
```

The `.global` bit in `add32.s` tells the linker to "export" that symbol, to make it available for other objects to find.

## Function Calling Convention

### 32-bit Arguments
For the following types (<= 32 bit):

```
uint8_t
int8_t
uint16_t
int16_t
uint32_t
int32_t
bool
```
The first 4 arguments of a function will be passed into the first 4 registers

```
fn(
   uint8_t,     uint8_t,    uint8_t,    uint8_t
   int8_t       int8_t      int8_t      int8_t
   uint16_t     uint16_t    uint16_t    uint16_t
   int16_t      int16_t     int16_t     int16_t
   uint32_t     uint32_t    uint32_t    uint32_t
   int32_t      int32_t     int32_t     int32_t
   bool         bool        bool        bool

    |            |           |           |
    V            V           V           V
    R0           R1          R2          R3
)
```
If there are more than 4 arguments, they are placed on the stack, which we won't cover in this class.

The output of the function will be put in `R0`, if it's <= 32 bit.

### 64-bit Arguments
If an argument is 64-bit, for example, then it will be split over 2 registers. The same is true when returning a value > 32 bit.

```
fn(uint64_t -> (R1:R0), uint8_t -> R2) -> uint64_t -> R1:R0
```

The higher register stores the MSB.

We can pass in a pointer to memory in place of one of these, which allows us to pass in many more types of values. In this class, we're just going to talk about ints and bools and stuff.


> Note: he references the ARMv7 manual on his site, [find it here](http://ranger.uta.edu/~jlosh/CSE2312/DDI0210C.pdf)

> Note: you should know GDB commands, go practice

He goes basically the same program but with `AND` and `OR`. 

# Assembly with Flags

here's our program

```c
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>

// This will pass x -> R1, R0
//                y -> R3, R2
extern uint64_t addU64(uint64_t x, uint64_t y);

int main()
{
    uint64_t x, y, z;
    x = 20000000000; // 20 billion
    y = 30000000000; // 30 billion
    // This won't fit in a uint64_t
    z = addU64(x, y);
    printf("x = %llu\n", x); // llu -> long long unsigned...
    printf("y = %llu\n", y); // just a format specifier
    printf("z = x + y = %llu\n", z);
    return EXIT_SUCCESS;
}
```

```s
.global addU64

.text

// uint64_t addU64(uint64_t x, uint64_t y);
// x in R1:R0 (bits 63-32 are in R1, bits 31-0 are in R0)
// Same case for y, in R3, R2
// Results are returned in R1:R0, just how x is passed in.
addU64:
    ADDS R0, R0, R2      // Add with flags
    ADC R1, R1, R3       // Adds with carry
    BX LR
```



When adding a 2 digit number, we could add the right most digits, then the left most digits. If the right most digits were > 9, we would have a "carry", and the left most digit would increase by 1. Adding 64 bit numbers is the same.

|  | `register` | `register` |
| ----- | ---------- | ---------- |
| `x` | `R1` | `R0` |
| + | + | + |
| `y` | `R3` | `R2` |
| `=` | `=` | `=` |
| `x + y` | `R1` | `R0` |

We would add `R0` (bits 31-0 of `x`) to `R2` (bits 31-0 of `y`) and if there was a carry, it would overflow into bit 32 of `R0` (where the result is going).

When adding the second bit, we use `ADC` which means "add including carry".

The `ADDS` command says "set flags as appropriate". In the manual, you may see `ADD{cond}{S}`, which means you can include the `S` to include flags.