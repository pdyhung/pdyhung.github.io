import tkinter as tk
from tkinter import *

root = tk.Tk()
root.geometry("+100+100")
root.title("Phạm Văn Hưng - Ca đoàn tử đạo - Giáo Xứ Vũng Tàu")

def get_value():
    obs = cad_select_object()
    index_number = int(str2.get())
    total_length = cad_mleader(obs , index_number)
    str1.set(total_length)

str1 = tk.StringVar()

e1 = tk.Entry(root , textvariable = str1)
e1.grid(row=3,column=1,padx = 20 , pady = 10)

index_number_lb = Label(root , text = "nhập lấy bao nhiêu số sau dấu phẩy") 
index_number_lb.grid(row=2,column=1,padx = 20 , pady = 10)

str2 = tk.StringVar()
e2 = tk.Entry(root , textvariable = str2)
str2.get()
e2.grid(row=2,column=2,padx = 20 , pady = 10)

bt1 = tk.Button(root, text="Chọn đối tượng text" , command =lambda:get_value() )
bt1.grid(row=1,column=1,padx = 20 , pady = 10)


def but_click():
    num = value1.get()
    print("Value is: " + str(num))

value1 = tk.IntVar()
cb1 = tk.Checkbutton(root, text = "Check Button", command = but_click ,  onvalue = 1 , offvalue = 0 , variable = value1)
cb1.grid(row=4,column=1,padx = 20 , pady = 10)





root.iconbitmap("hung_pham.ico")

root.mainloop()