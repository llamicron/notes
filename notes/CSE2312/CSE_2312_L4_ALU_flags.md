# L4 - ALU Flags
Luke Sweeney

CSE 2312

Dr. Losh

UT Arlington

Jan 28, 2021


# ALU Flags
Previously we talked about the ALU. ALU's have "falgs", which are extra bits of output that tell us something about the actual output.

Note: We're only talking about 8-bit ALUs here. The same principles apply for higher bit ALUs.


## Carry flag `c`
For example, if you try to add two `8-bit` numbers, `255 + 2`, you'll get `1`. The "carry flag" `(c)` will be equal to one.

Behind the scenes, the ALU doesn't know if the number is signed or unsigned. We should ignore the carry flag if it's a signed number
```c
uint8_t x = 255;
uint8_t y = 2;

x + y
```
```
  1 1 1 1 1 1 1 1  (unsigned binary 255)
+ 0 0 0 0 0 0 1 0  (unsigned binary 2)
-----------------
  0 0 0 0 0 0 0 1  (unsigned binary 1 (not correct))

c = 1
(carry flag = 1)
```

If the numbers are signed, we should ignore the flag sometimes

```c
int8_t x = -1;
int8_t y = 2;

x + y
```
```
  1 1 1 1 1 1 1 1  (signed binary -1 (two's complement))
+ 0 0 0 0 0 0 1 0  (signed binary 2)
-----------------
  0 0 0 0 0 0 0 1  (signed binary 1 (correct))

c = 1
(carry flag = 1)
```

Anytime you add two negatives and get a positive, or add two non-negatives and get a negatives, you'll get a `V` flag. We won't use this on the test or HW. There are 4 cases that cause the `V` flag. We won't really go over it.

## Zero flag `z`
If you add two number that sum to 0, you get the `z` flag. (Note: the `c` flag would be set here, but we're looking at the flags one at a time)

```c
int8_t x = 2;
int8_t y = -2;

x + y
```
```

  0 0 0 0 0 0 1 0   (signed 2)
+ 1 1 1 1 1 1 1 0   (signed -2)
-----------------
  0 0 0 0 0 0 0 0

[z = 1]
```

## Negate/sign flag `s`
There is also a signed bit flag `s` that is 1 when the signed bit it equal to 1.

```c
int8_t x = -2;
int8_t y = -1;

x + y
```
```
  1 1 1 1 1 1 1 0   (signed -2)
+ 1 1 1 1 1 1 1 1   (signed -1)
-----------------
  1 1 1 1 1 1 0 1   (signed -3)

[s = 1]
```

In this example, the signed bit is 0
```c
int8_t x = -2;
int8_t y = 3;

x + y
```
```
  1 1 1 1 1 1 1 0   (signed -2)
+ 0 0 0 0 0 0 1 1   (signed 3)
-----------------
  0 0 0 0 0 0 0 1   (signed 1)

[s = 0]
```

Here's another example
```c
uint8_t x = 64;
uint8_t y = 64;

x + y
```
```
  0 1 0 0 0 0 0 0    (signed 64)
+ 0 1 0 0 0 0 0 0    (signed 64)
-----------------
  1 0 0 0 0 0 0 0   (signed 128)

[s = 1]
```


## Examples with Multiple Flags

```c
int8_t x = -128;
int8_t y = -128;

x + y
```

```
  1 0 0 0 0 0 0 0    (signed -128)
+ 1 0 0 0 0 0 0 0    (signed -128)
-----------------
  0 0 0 0 0 0 0 0

  [
    c = 1
    z = 1
    s = 0
    V = 1
  ]
```

Don't worry too much about the overflow flag `V`. Because there is a carry, `c = 1`, because the sign bit (MSB) is 0, `s = 0`, and because the result is `0`, `z = 1`.

Because we added signed integers, we're ignoring the `c` flag.


Here's the same xample with unsigned integers

```c
uint8_t x = 128;
uint8_t y = 128;

x + y
```

```
  1 0 0 0 0 0 0 0    (unsigned -128)
+ 1 0 0 0 0 0 0 0    (unsigned -128)
-----------------
  0 0 0 0 0 0 0 0

  [
    c = 1
    z = 1
    s = 0
    V = 1
  ]
```

Here, the carry bit `c` is "worth" `2^8`.

## Flag Summary

| Flag | Meaning | -- |
| --- | --- | -- |
| `z = 1` | `Result = 0` | -- |
| `z = 0` | `Result != 0` | -- |
| `c = 1` | Result carried out/borrow in | -- |
| `c = 0` | No carry out/borrow in | -- |
| `v = 1` | Overflow | Not on homework/test |
| `v = 0` | No overflow | Not on homework/test |
| `n = 1/s = 1` | MSB was one | -- |
| `n = 0/s = 0` | MSB was zero | -- |


# Logical Operators

```c
// In Hex
uint8_t x = 0x11;
uint8_t y = 0x37;
uint8_t z;

z = x & y;
```

```
  0 0 0 1 0 0 0 1   (0x11)
& 0 0 1 1 0 1 1 1   (0x37)
-----------------
  0 0 0 1 0 0 0 1   (0x11)

flags [
  z = 0
  s = 0
]
```

Another example,
```c
uint8_t x = 0x21;
uint8_t y = 0x42;

x & y
```
```
  0 0 1 0 0 0 0 1   (0x21)
& 0 1 0 0 0 0 1 0   (0x42)
-----------------
  0 0 0 0 0 0 0 0   (0x00)

flags [
  z = 1
  s = 0
]
```


This is cool: the master start and end bytes for the STR116 relay board are 0x55 and 0xAA, here's why.

```c
uint8_t x = 0x55;
uint8_t y = ~x;
```
```
  0 1 0 1 0 1 0 1   (x = 0x55)
~ 0 1 0 1 0 1 0 1   (x = 0x55)
-----------------
  1 0 1 0 1 0 1 0   (y = 0xAA)

flags [
  s = 1
  z = 0
]
```

For negation, you take the inverse then add 1. Remember that `~` (not/inverse) and `-` (negate) are different.
```c
int8_t x = 2;
int8_t y = -x;
```
```
  0 0 0 0 0 0 1 0     (signed 2)      Starting number
~ 0 0 0 0 0 0 1 0     (signed 2)      Take the inverse ('not' itself)
-----------------
  1 1 1 1 1 1 0 1     (signed -3)     We get -3 from the not
+ 0 0 0 0 0 0 0 1     (signed 1)      Add 1
-----------------
  1 1 1 1 1 1 1 0     (signed -2)     Our result is -2, or -x

```

The rest of the operators work just like how we learned in 1320, it's pretty simple. 