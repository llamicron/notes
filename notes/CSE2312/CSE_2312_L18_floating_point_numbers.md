# L18

| Apr 8, 2021  | CSE 2312 | Dr. Losh | UT Arlington | Luke Sweeney |
| ------------ | -------- | -------- | ------------ | ------------ |

Note: look in `llamicron/cse2312` for an example in `C` about how numbers are incoded.

# Floating Point Numbers

Floating point numbers are different from ints. In `C` we have the `float` type

```c
float x = 1.25;
```

The IEEE 754 standard lays out a single-precision floating point numbers.

```
31 30         23 22                     0
-----------------------------------------
| S |  Exponent | Mantissa (fractional) |
-----------------------------------------
```

To encode 0.0, `S = E = F = 0`

Normally when the number isn't zero, then we get

```
(-1)^(S) * 2^(E - 127) * 1.[fractional]
```

A sign bit of `1` gets us `(-1)^1 = -1`. A sign bit of `0` gets us `(-1)^0 = +1`.

The exponent part is pretty self explanitory. If `E < 127` then we'll get `1/4` or `1/8` or some shit, otherwise we'll get a positive power of 2.

The mantissa is added after the decimal, so if we store `425` in there then it will multiply by `1.425`

## Examples

```
1 = -1^0 * 2^(127 - 127) * 1.00...
S = 0, E = 127, F = 0

-------------------------
| 0 01111111 0000000... |
-------------------------

In hex we would split this into 4-bit words

-----------------------------------
| 0011 / 1111 / 1000 / 0000 / ... |
|    3 /    F /    8 /    0 / ... |
-----------------------------------

So 1 as a float is stored as 0x3F800000 hex
```


```
2 = -1^0 * 2^(128-127) * 1.00...
  =  1   * 2           * 1
S = 0, E = 128, F = 0


--------------------------
| 0 10000000 0000000 ... |
--------------------------

In hex
-----------------------------------
| 0100 / 0000 / 0000 / 0000 / ... |
|    4 /    0 /    0 /    0 / ... |
-----------------------------------

2 = 0x40000000
```

```
0.25 = -1^0 * 2^(-2) * 1.00....
     =    1 * 1/4    * 1
S = 0, E = 125, F = 0
```

## Method

### Step 1 - Convert to binary
First we should convert to binary. Let's look at `17.625`

```
For decimals we have this
... 2^4 2^3 2^2 2^1 2^0 . 2^-1 2^-2 2^-3 2^-4 2^-5 ...

We subtract just like we would normally convert to binary

  17.625
- 16.000 (2^4)
---------------------
   1.625
-  1.000 (2^0)
---------------------
   0.625
-  0.500 (2^-1 = 1/2)
---------------------
   0.125
-  0.125 (2^-3 = 1/8)
---------------------

We subtracted (2^4), (2^0), (2^-1), and (2^-3), so those are the set bits in the number

17.625 base 10 = 10001.101 base 2
```

## Step 2 - conform to formula

We want our number as `1.xxx`

```
10001.101 (base 2) = 1.0001101 (base 2) * 2^4
                   = (-1)^0 * 2^4 * 1.0001101
S = 0, E = 10000011 (131), F = 00011010000000000000000

--------------------------------------
| 0 10000011 00011010000000000000000 |
--------------------------------------

---------------------------------------------------------
| 0100 / 0001 / 1000 / 1101 / 0000 / 0000 / 0000 / 0000 |
|    4 /    1 /    8 /    D /    0 /    0 /    0 /    0 |
---------------------------------------------------------

17.625 = 0x418D0000 as a flaot
```
