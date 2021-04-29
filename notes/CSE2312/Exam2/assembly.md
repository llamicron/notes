# Assembly Examples

`hw4.s`
```s
@ Returns the sum of the elements in an array (x) containing (count) entries
@ float sumF32(const float x[], uint32_t count);
@ x[0] -> R0
@ count -> R1
@ Return in S0
sumF32:
    MOV R2, #0
    VMOV S0, R2             @ Move sum = 0 into S0
sumF32_loop:
    CMP R1, #0              @ Compare count with 0
    BEQ sumF32_end          @ If it's 0, then quit

    VLDR S1, [R0]           @ Load float from x[i] into S1

    VADD.F32 S0, S0, S1     @ Add S1 to sum S0
    ADD R0, R0, #4          @ Increment R0
    SUB R1, R1, #1          @ Decrement count

    B sumF32_loop           @ Repeat
sumF32_end:
    BX LR




@ Returns the product of the elements in an array (x) containing (count) entries
@ double prodF64(const double x[], uint32_t count);
prodF64:
    CMP R1, #0
    BEQ prodF64_end     @ If there aren't any values, end

    VLDR D0, [R0]       @ otherwise, load the first value so we're not multiplying by 0
    SUB R1, R1, #1      @ Decrement count
    ADD R0, R0, #8      @ Increment index
prodF64_loop:
    CMP R1, #0          @ Is the count 0?
    BEQ prodF64_end     @ If so then end

    VLDR D1, [R0]       @ read next value in array
    ADD R0, R0, #8      @ Increment by size of double (8 bytes)
    VMUL.F64 D0, D0, D1 @ Vector add D1 to D0
    SUB R1, R1, #1      @ Subtract count

    B prodF64_loop
prodF64_end:
    BX LR

@ Returns the dot product of two arrays (x and y) containing (count) entries
@ double dotpF64(const double x[], const double y[], uint32_t count);
@ D0 = return value
@ D1 = x[i]
@ D2 = y[i]
@ R0 = x[0]
@ R1 = y[0]
@ R2 = count
dotpF64:
    MOV R3, #0              @ Load a 0
    VMOV D0, R3, R3         @ Store a 0 into D0
dotpF64_loop:
    CMP R2, #0              @ Compare count to 0
    BEQ dotpF64_end         @ If it's 0, we're done

    VLDR D1, [R0]           @ Load x[i] into D1
    VLDR D2, [R1]           @ Load y[i] into D2

    VMUL.F64 D1, D1, D2     @ Multiply both and store in D1
    VADD.F64 D0, D0, D1     @ Add D1 to D0

    ADD R0, R0, #8          @ Increment both
    ADD R1, R1, #8

    SUB R2, R2, #1          @ Decrement count

    B dotpF64_loop          @ Loop again
dotpF64_end:
    BX LR

@ Returns the maximum value in the array (x) containing (count) entries
@ float maxF32(const float x[], uint32_t count);
@ R0 = x[0]
@ R1 = count
@ S0 = max
@ S1 = current
maxF32:
    CMP R1, #0              @ If the count is 0, quit
    BEQ maxF32_end
    VLDR S0, [R0]           @ Load x[0] in S0
maxF32_loop:
    CMP R1, #0              @ If the count is 0, quit
    BEQ maxF32_end

    VLDR S1, [R0]           @ Load x[i] in S1
    VCMP.F32 S0, S1         @ Compare S0 - S1
    VMRS APSR_nzcv, FPSCR   @ I have no idea why this is necessary but it is
    VMOVMI S0, S1           @ If S0 is smaller, move S1 into S0

    SUB R1, R1, #1          @ Decrement count
    ADD R0, R0, #4          @ Increment R0

    B maxF32_loop
maxF32_end:
    BX LR
```

---

`sumF64.s`
```
// double sumF64(const double x[], uint32_t count);
sumF64:
    MOV R2, #0          @ this gets us 32 bits of 0
    VMOV D0, R2, R2     @ This gets us 64 bits of 0
sumF64_loop:
    CMP R1, #0          @ Is the count 0?
    BEQ sumF64_end

    VLDR D1, [R0]       @ read next value in array
    ADD R0, R0, #8      @ Increment by size of double (8 bytes)
    VADD.F64 D0, D0, D1 @ Vector add D1 to D0
    SUB R1, R1, #1      @ Subtract count

    @ D0 could store a double, int64_t or uint64_t, so we add the .F64 or .F32
    @ so it knows what it's operating on

    B sumF64_loop
sumF64_end:
    BX LRs
```

---

`hw3.s`
```s


@ Question 2a -------------------------------------------
@ bool isStrEqual(const char str1[], const char str2[]);
@ Return 1 or 0 (true or false)
@ R0 = result
@ R1 = str1[0]
@ R2 = str2[0]
@ R3 = index
@ R4 = char1
@ R5 = char2
isStrEqual:
    @ Setup
    PUSH {R4-R5}        @ Push registers
    MOV R2, R0          @ Move str2 into R2
    MOV R3, #0          @ R3 is the str index
    MOV R0, #1          @ Assume they're equal until we get a negative case
isStrEqual_loop:
    LDRSB R4, [R1, R3]      @ Load str1[i] into R4
    LDRSB R5, [R2, R3]      @ load str2[i] into R5

    CMP R4, R5          @ Compare chars

    MOVNE R0, #0        @ If the chars aren't equal, return false
    BNE isStrEqual_end

    @ Once we get here, we know that R4 == R5, we can test either one
    CMP R4, #0          @ If R4 = '\0', end
    BEQ isStrEqual_end

    @ If they're equal, go to the next iteration
    ADD R3, R3, #1
    B isStrEqual_loop
isStrEqual_end:
    @ Pop registers
    POP {R4-R5}
    @ End
    BX LR


@ Question 2b -----------------------------------------
@ void strConcatenate(char strTo[], const char strFrom[]);
@ R0 = strTo
@ R1 = strFrom
strConcatenate:
    MOV R4, #0
strConcatenate_len:             @ This gets the length of str1 -> R4
    LDRSB R3, [R0, R4]
    CMP R3, #0
    BEQ strConcatenate_loop1
    ADD R4, R4, #1
    B strConcatenate_len
strConcatenate_loop1:
    LDRB R3, [R0], #1           @ Load char into R3, post increment R0 (str1)
    STRB R3, [R2], #1           @ store char into R2 (str3), port increment R2 (str3)
    SUBS R4, #1
    BNE strConcatenate_loop1

strConcatenate_loop2:
    LDRB R3, [R1], #1           @ Load char into R3, post increment R1 (str2)
    STRB R3, [R2], #1           @ store char into R2 (str3), port increment R2 (str3)
    CMP R3, #0                  @ until we reach the end
    BNE strConcatenate_loop2
    BX LR


@ Question 2c -----------------------------
@ int32_t sumS32(const int32_t x[], uint32_t count);
@ R0 = sum
@ R1 = count
@ R2 = x[0]
@ R3 = Loaded num
sumS32:
    MOV R2, R0              @ Move x[0] into R2
    MOV R0, #0              @ move 0 into R0 (sum)
sumS32_loop:
    LDRSB R3, [R2]          @ load x[i] into R3
    ADD R0, R0, R3          @ add R3 to the sum (R0)
    ADD R2, #4              @ Add 4 to x to increment to the next one
    SUB R1, R1, #1          @ Subtract 1 from the remaining count
    CMP R1, #0              @ check if there's any more
    BNE sumS32_loop         @ if so, loop again
    BX LR                   @ otherwise return





@ Question 2d --------------------------------------
@ uint32_t countAboveLimit(const int32_t x[], int32_t limit, uint32_t count);
@ Returns the number of values in the array containing count entires that are > limit
@ R0 = result
@ R1 = limit
@ R2 = count (array length) * 4
@ R3 = x[0]
@ R4 = loaded x[i] value
countAboveLimit:
    PUSH {R4}
    MOV R3, R0                  @ Move x[0] into R3
    MOV R0, #0                  @ Move result into R0
    MOV R2, R2, LSL #2          @ This multiplies R2 by 2^2 (4) so we can use it as an index
countAboveLimit_loop:
    SUB R2, R2, #4              @ Subtract 4 (sizeof(int32_t)) from the index
    LDRSB R4, [R3, R2]          @ Load (right to left) the numbers in x[]
    CMP R4, R1                  @ Compare to the limit
    ADDPL R0, R0, #1            @ If it's above, then add 1 to R0
    CMP R2, #0                  @ Compare the index to 0
    BNE countAboveLimit_loop    @ If there's still more, loop again 
countAboveLimit_end:            @ Otherwise return
    POP {R4}
    BX LR



@ Question 2e -------------------------------------------------------
@ void leftString(char* strOut, const char* strIn, uint32_t length);
@ R0 = strOut
@ R1 = strIn
@ R2 = length
leftString:
    CMP R2, #0              @ See if we've reached the limit
    BXEQ LR                 @ If so then end  

    LDRSB R3, [R1], #1      @ Load a char from strIn
    STRB  R3, [R0], #1      @ Store in at the same index in strOut
    
    SUB R2, R2, #1          @ Subtract 1 from the count
    B leftString            @ Repeat the loop



@ Question 2g --------------------------------------------
@ void sortAscendingInPlace(uint32_t x[], uint32_t count);
@ R0 = x[0]
@ R1 = count
@ R2 = index
@ R3 = loaded num
@ R4 = loaded num 2
@ R5 = changes?
sortAscendingInPlace:
    PUSH {R4-R5}
    MOV R2, #0
    MOV R5, #0
    MOV R1, R1, LSL #2          @ Multiply count by 4 (size of uint32_t)

sort_loop:                      @ tries to sort the list
    LDRB R3, [R0, R2]           @ Get x[i] -> R3

    ADD R2, R2, #4              @ Add sizeof(32 bit int) ie. i++

    CMP R2, R1                  @ Check if we're at the end 
    BPL sort_check              @ If we've gone past the end, go to the check

    LDRB R4, [R0, R2]           @ Otherwise, get x[i + 1] -> R4

    CMP R3, R4                  @ Compare nums
    BMI sort_loop               @ If R3 < R4, go to the next pair
    BEQ sort_loop               @ Same if they're equal
    STRB R3, [R0, R2]           @ Otherwise, R3 > R4. store R3 -> x[i + 1]
    SUB R2, R2, #4              @ Move back
    STRB R4, [R0, R2]           @ Store R4 -> x[i]
    ADD R2, R2, #4              @ Move back back
    ADD R5, R5, #1              @ Change counter ++

    CMP R2, R1                  @ Check if we're at the end 
    BEQ sort_check              @ If so, check
    B sort_loop                 @ If not, go to the next pair

sort_check:
    CMP R5, #0                  @ If there's no changes, it's sorted
    BEQ sort_end                @ End
    
    MOV R5, #0                @ Reset the change counter
    MOV R2, #0                @ Reset the index
    B sort_loop               @ sort again
    
sort_end:
    POP {R4-R5}
    BX LR





@ Question 2h ---------------------------------
@ int16_t decimalStringToInt16(const char * str) 
@ R0 = return value
@ R1 = str
@ R2 = loaded char
@ R3 = factor
@ R4 = 10 (this needs a register for some reason for MUL)
@ R5 = strlen
@ I am a genius
decimalStringToInt16:
    PUSH {R4-R5}                @ Prepare our registers
    MOV R1, R0
    MOV R0, #0
    MOV R3, #1
    MOV R4, #10
    MOV R5, #0

decimalStringToInt16_strlen:        @ This reads the length of the str into R5
    LDRSB R2, [R1, R5]              @ So we can read form right to left
    CMP R2, #0
    ADDNE R5, R5, #1
    BNE decimalStringToInt16_strlen

decimalStringToInt16_loop:
    SUB R5, R5, #1                  @ Subtract 1 from the strlen since it was pointing at null

    LDRSB R2, [R1, R5]              @ Load the char (right to left)

    CMP R2, #'-'                    @ First off, if it's a dash then negate the number and quit
    BEQ decimalStringToInt16_negate @ Nothing can come after the -

    CMP R2, #0                      @ If we're at the end of the str
    BEQ decimalStringToInt16_end    @ Return

    SUB R2, R2, #48                 @ Subtract 48 because ASCII exists
    CMP R2, #10                     @ Compare with 10
    BPL decimalStringToInt16_loop   @ If it's higher than 10, iterate again
    CMP R2, #0                      @ Compare with 0
    BMI decimalStringToInt16_loop   @ If it's lower than 0, iterate again

    MUL R2, R2, R3                  @ Multiply our number by it's place value factor, 10^(R3)
    ADD R0, R0, R2                  @ Add to R0

    MUL R3, R3, R4                  @ Update place value factor 
    B decimalStringToInt16_loop     @ iterate again

decimalStringToInt16_negate:        @ Negates R0 then returns
    MVN R0, R0
    ADD R0, R0, #1
    B decimalStringToInt16_end

decimalStringToInt16_end:
    POP {R4-R5}
    BX LR




@ Question 2i ---------------------------------
@ uint8_t hexStringToUint8(const char * str);
@ R0 = sum
@ R1 = str
@ max u8 value -> 255
@ highest hex value in 2 characters -> FF -> 255
@ We can only use the first two chars and it won't be too big
hexStringToUint8:
    MOV R1, R0
    MOV R0, #0

    LDRSB R2, [R1], #1
    LDRSB R3, [R1]

hexStringToUint8second_char:
    @ Second Char (right char)
    @ 0-9
    SUB R3, #48                         @ 48 = ascii '0', subtract 48, now 0 = '0', 1 = '1', etc.
    CMP R3, #10                         @ Make sure it's a digit
    ADDMI R0, R3                        @ If it's 0-9, add it
    BMI hexStringToUint8first_char      @ We want to branch here, otherwise a digit will trip
                                        @ the check below and be added again
    
    @ A-F
    SUBPL R3, #7            @ There are misc chars between '9' and 'A' (65), subtract 7
    CMP R3, #17             @ Compare to 17, we only want 10-17 (already checked for 0-9 above)
    ADDMI R0, R3            @ Add it if its in range

hexStringToUint8first_char:
    @ First Char (left char)
    @ 0-9
    SUB R2, #48             @ 48 = ascii '0', subtract 48, now 0 = '0', 1 = '1', etc.
    CMP R2, #10             @ Make sure it's a digit
    MOVMI R2, R2, LSL #4
    ADDMI R0, R2            @ If it's 0-9, add it (*16)
    BMI hexStringToUint8_end

    @ A-F
    SUBPL R2, #7            @ There are misc chars between '9' and 'A' (65), subtract 7
    CMP R2, #17             @ Compare to 17, we only want 10-17 (already checked for 0-9 above)
    MOVMI R2, R2, LSL #4
    ADDMI R0, R2            @ Add it if its in range (*16)

hexStringToUint8_end:
    BX LR

```
