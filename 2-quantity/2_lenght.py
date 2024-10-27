import win32com.client
import pythoncom
import math

import tkinter as tk
from tkinter import *

acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

def APoint(x, y, z=0):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (x, y, z))

def aDouble(xyz):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (xyz))

def aVariant(vObject):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_DISPATCH, (vObject))

def cad_select_object():
	try:
		acad_Doc.SelectionSets.Item("SS1").Delete()
	except:
		print("Delete selection failed")
	ssetObj = acad_Doc.SelectionSets.Add("SS1")
	ssetObj.SelectOnScreen()
	return ssetObj

def cal_length(objects, index_number):
	total_length = 0
	for ob in objects:
		total_length = total_length + ob.Length
	total_length = round(total_length, index_number)
	return total_length

root = tk.Tk()
root.geometry("+100+100")
root.title("Phạm Văn Hưng - Ca đoàn tử đạo - Giáo Xứ Vũng Tàu")

def get_value():
	obs = cad_select_object()
	index_number = int(str2.get())
	total_length = cal_length(obs , index_number)
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

bt1 = tk.Button(root, text="Chọn đối tượng cần tính chiều dài" , command =lambda:get_value() )
bt1.grid(row=1,column=1,padx = 20 , pady = 10)

root.iconbitmap("hung_pham.ico")

root.mainloop()