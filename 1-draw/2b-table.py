import csv
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

def ac_table():
	with open("TAM DAN + HO GA - D1.csv", mode="r") as f:

		data_id = []
		data_x = []
		data_y = []
		data = f.readline()
		while data != "":
			data_new = data.split(",")
			data_id.append(data_new[0])
			data_x.append(data_new[1])
			data_y.append(data_new[2])
			data = f.readline()

		ac_table_pos = acad_Doc.Utility.GetPoint()
		print(ac_table_pos)
		InsertionPoint = APoint(ac_table_pos[0],ac_table_pos[1],0)
		NumRows = len(data_id) + 1
		NumColumns = 3
		RowHeight = 5
		ColWidth = 20
		draw_table = acadModel.AddTable(InsertionPoint, NumRows, NumColumns, RowHeight, ColWidth)
		draw_table.DeleteRows(0,1)

		for i in range(len(data_id)):

			draw_table.SetText(i, 0, data_id[i])
			draw_table.SetText(i, 1, data_x[i])
			draw_table.SetText(i, 2, data_y[i])
			draw_table.SetCellTextHeight(i, 0, 2)
			draw_table.SetCellTextHeight(i, 1, 2)
			draw_table.SetCellTextHeight(i, 2, 2)

			draw_table.SetCellAlignment(i, 0, 5)
			draw_table.SetCellAlignment(i, 1, 5)
			draw_table.SetCellAlignment(i, 2, 5)

			draw_table.SetCellTextStyle(i, 0, 2)
			draw_table.SetCellTextStyle(i, 1, 2)
			draw_table.SetCellTextStyle(i, 2, 2)


def main():
	ac_table()


main()

print("complete! ")