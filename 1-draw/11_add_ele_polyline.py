# from pyautocad import Autocad, APoint, aDouble

import os
import math
import win32com.client
import pythoncom
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

class Polyline_cad:
	def __init__(self, x_list, y_list, z_list):
		self.x_list = x_list
		self.y_list = y_list
		self.z_list = z_list

def add_elevation():
	number_add = float(input("input number add: "))
	ele_begin = []

	print("--chon polyline--")
	poly = cad_select_object()
	for i in poly:
		i.Elevation = i.Elevation + number_add
		print(i.Elevation)


def main():
	add_elevation()


main()

print("hoàn thành")