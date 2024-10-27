from pyautocad import Autocad, APoint, aDouble

# import win32com.client
# acad = win32com.client.Dispatch("AutoCAD.Application")

import win32com.client
import pythoncom
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

a = Autocad(create_if_not_exists = True, visible = False)


def cad_select_dim():
	with open("data_dim.csv", mode="w") as file:
		# d = 0
		e = ""
		b = a.get_selection()
		for i in b:
			c = i.Measurement
			e = e + "+" + str(round(c,2))
			# d = d + c
			# i.TextOverride = "Pham Van Hung <> + " + str(round(c,2))
		file.write(e)

def cad_select_block_c():
	with open("data_dim.txt", mode="w") as file:
		b = a.get_selection()
		for i in b:
			c = i.InsertionPoint
			file.write(c)

def cad_select_hatch():
	with open("data_hatch.csv", mode="w") as file:
		e = ""
		b = a.get_selection()
		for i in b:
			c = i.Area
			e = e + "+" + str(round(c,2))
			d = i.Centroid
			d = str(d).strip("(").strip(")")
			file.write(d + "\n")
			d = d.split(",")
			a.model.AddText(str(round(c,2)), APoint(float(d[0]),float(d[1])),2)
		file.write(e)

def cad_select_block():
	with open("data_block.csv", mode="w") as file:
		# e = ""
		# toa_do_x = []
		# toa_do_y = []
		b = a.get_selection()
		# for i in b:
		# 	d = i.InsertionPoint
		# 	d = str(d).strip("(").strip(")")
		# 	file.write(d + "\n")
		# 	d = d.split(",")
		# 	toa_do_x.append(d[0])
		# 	toa_do_y.append(d[1])
		# a.model.AddDimAligned (APoint(float(toa_do_x[0]), float(toa_do_y[0])), APoint(float(toa_do_x[1]), float(toa_do_y[1])), APoint(float(toa_do_x[1]) + 2, float(toa_do_y[1])) + 2)
		for i in b:
			name = i.EntityName		
			if name == 'AcDbBlockReference':
				HasAttributes = i.HasAttributes
				if HasAttributes:
					for attrib in i.GetAttributes():
						print("  {}: {}".format(attrib.TagString, attrib.TextString))


def cad_select_object():
	# with open("data_object.csv", mode="w") as file:
	try:
		acad_Doc.SelectionSets.Item("SS1").Delete()
	except:
		print("Delete selection failed")
	ssetObj = acad_Doc.SelectionSets.Add("SS1")
	ssetObj.SelectOnScreen()
	for i in ssetObj:
		# name = i.EntityName		
		# if name == 'AcDbBlockReference':
		HasAttributes = i.HasAttributes
		if HasAttributes:
			for attrib in i.GetAttributes():
				print("  {}: {}".format(attrib.TagString, attrib.TextString))

def cad_get_point():
	hung = acad_Doc.Utility.Getpoint()
	print(hung)

def main():
	# cad_select_dim()
	# cad_select_hatch()
	# cad_select_block()
	# cad_select_object()
	# cad_get_point()
	cad_select_block_c()


main()

print("complete! ")