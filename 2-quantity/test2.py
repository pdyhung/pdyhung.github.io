import win32com.client
import pythoncom
import math

# import tkinter as tk
# from tkinter import *

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

def main():
	path1 = acad_Doc.FullName
	name_cad = acad_Doc.Name
	path2 = path1.replace(name_cad , "")
	with open("test_name.txt", "w" , encoding="utf-8-sig") as file:
		file.write(path1 + "\n" + name_cad + "\n" + path2)
	with open(path2 + "test_name1.txt" , "w" , encoding="utf-8-sig") as file2:
		file2.write("hello world")

main()

print("complete!")

