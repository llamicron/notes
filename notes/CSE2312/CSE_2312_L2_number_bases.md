# L2 - Number Bases
Luke Sweeney

CSE 2312

Dr. Losh

UT Arlington

Jan 21, 2021

# Bases
Humans use decimal (base 10) because it's easy for us. For the number 123 (base 10)

```
1       2       3
1*10^2  2*10^1  3*10^0
100    +20     +3      = 123
```

In general, each digit from the right has the value of `(digit) * (base)^(position from right)`. The digits within a base are `0-(base - 1)`.


# C Variable types
In the C99 convention:

| Type | | Min | Max |
| --- | --- | --- | -- |
| `uint8-t` | unsigned 8-bit integer | `0` | `2^8 - 1 = 255` |
| `uint16-t` | unsigned 16-bit integer | `0` | `2^16 - 1 = 65535` |
| `uint32-t` | unsigned 32-bit integer | `0` | `2^32 - 1 = 4 billion something` |
| `int8_t` | signed 8-bit integer | `-128` | `127` |
| generic:  `uintN-t` | not an actual type | `0` | `2^N - 1` |



# Binary
For binary, the digits (bits) are `0-(base-1) = 0-1`.

Each bit (from the right) with have a value of `(bit) * 2^(position from right)`


For the binary number `10101101`
```
1     0     1     0     1     1     0     1
2^7   2^6   2^5   2^4   2^3   2^2   2^1   2^0
128  +0    +32   +0    +8    +4    +0    +1    = 173 (base 10) 
```

## Converting to Binary
If you have a number in a C program

```c
uint8_t x = 67;
```

The computer will store this number in binary. The `uint` part tells us we don't need to use two's complement (more on that later), it converts to binary.

We iteratively subtract the largest power of 2 we can without going negative until we reach 0.
```
67 - (64) = 3 - (2) = 1 - (1) = 0
```

All the bits that represent the numbers in parenthesis in the binary number will be 1's.

```
0     1     0     0     0     0     1     1
2^7   2^6   2^5   2^4   2^3   2^2   2^1   2^0
+0   +64    +0    +0    +0    +0    +2    +1    = 67 (base 10) 
```

## Two's Complement
To store a negative number, we can designate the MSb (most significant bit) as negative.

```
-2^7   2^6   2^5   2^4   2^3   2^2   2^1   2^0
-128   64    32   16     8     4     2     1   
```

We can convert the same way, but when adding the MSb we add `-128` instead of `128`. This changes the min and max range of our number to `-128 - 127`.

This poses a problem: `11111111` is `-1` if it's a two's complement, but it's `255` if it's not. We use variable types in C to determine the value.

```c
// Unsigned int (normal)
uint8_t x = 255;
int8_t y = -1;

// Both of these numbers will be stored as 11111111
```
