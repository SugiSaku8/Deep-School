$$ \frac{39}{10} $$
@tag unit-title [open] Jla-2 数学 Unit 1
@tag unit-title [close]
@tag chapter-title [open] 式の計算 1節 用語 Chapter 1
@tag chapter-title [close]

@tag n1 [open]

@tag question [open]
a+b+c=$$ \frac{23}{20} $$,$$ \frac{1}{a+b} $$+$$ \frac{1}{b+c} $$+$$ \frac{1}{c+a} $$=b/br
このとき$$ \frac{a}{b+c} $$+$$ \frac{b}{c+a} $$+$$ \frac{c}{a+b} $$の値を求めなさい。
@tag question [close]

@tag answer [open]

@input q1_input [open]
すぎさくならとけるよね?:)
@btn on=^set^ 回答する
@input q1_input futter=q1_answer [close] 

@futter q1_answer futter=q1_answer [open]
正解は「$$ \frac{39}{10} $$」です。
@futter q1_answer futter=q1_answer [close]

@tag answer [close]

@btn id=next1 次へ

@tag n1 [close]

@script on=next1 [open]
dom.Tag("n1").style.display('none','auto');
dom.Tag("n2").style.display('block','auto');
dom.answer.set.ID("q1_input").txt('$$ \frac{39}{10} $$');
dom.answer.set.ID("q1_input").config('AI');
@script [close]