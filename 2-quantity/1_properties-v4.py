from pyautocad import Autocad
import math
import win32com.client
import pythoncom
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

a = Autocad(create_if_not_exists = True, visible = False)

def APoint(x, y, z=0):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (x, y, z))

def aDouble(xyz):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (xyz))

def aVariant(vObject):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_DISPATCH, (vObject))

def cad_select_dim():
	with open("data_dim.csv", mode="w") as file:
		# d = 0
		e = ""
		b = cad_select_object()
		for i in b:
			c = i.Measurement
			e = e + "+" + str(round(c,2))
		file.write(e)

def cad_select_hatch():
	with open("data_hatch.csv", mode="w") as file:
		e = ""
		b = cad_select_object()
		for i in b:
			c = i.Area
			e = e + "+" + str(round(c,2))
			file.write(str(round(c,2)) + "\n" + "\n")
		file.write(e)

def cad_select_block():
	with open("data_block.csv", mode="w") as file:
		b = cad_select_object()
		for i in b:
			name = i.EntityName		
			if name == 'AcDbBlockReference':
				HasAttributes = i.HasAttributes
				if HasAttributes:
					for attrib in i.GetAttributes():
						print("  {}: {}".format(attrib.TagString, attrib.TextString))

def cad_select_object():
	try:
		acad_Doc.SelectionSets.Item("SS1").Delete()
	except:
		print("Delete selection failed")
	ssetObj = acad_Doc.SelectionSets.Add("SS1")
	ssetObj.SelectOnScreen()
	return ssetObj

def cad_select_polyline():
	with open("data_polyline.csv", mode="w") as file:
		# d = 0
		e = ""
		b = cad_select_object()
		for i in b:
			c = i.Length
			e = e + "+" + str(round(c,2))
			file.write(str(round(c,2)) + "\n" + "\n")
		file.write(e)

def cad_select_mleader():
	with open("data_mleader.csv", mode="w") as file:
		f = ""
		b = cad_select_object()
		for i in b:
			c = i.TextString
			print(c)
			d = c.split("=")
			e = d[1].replace("\Fvn_vni|c163;","").replace("\Fvn_vni|c0;m2}","").replace("m\H0.7x;\S2^;}","").replace("m{\H0.7x;\S2^;}}","").replace("m}","").replace("m2}","")
			file.write(e + "\n" + "\n")
			f = f + "+" + e
		file.write(f)

def show_menu():
	print("......")
	print("WROTE BY PHẠM VĂN HƯNG IN 2023 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
	print("......")
	print("option 1: select object dim: ")
	print("option2: select object hatch: ")
	print("option3: select object block: ")
	print("option4: select object polyline: ")
	print("option5: select object mleader, text, mtext ...: ")
	print("option7: save and exit")
	print("......")

def seleck_in_range(prompt, min, max):
	choice = input(prompt)
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice

def main():
	while True:
		show_menu()
		choice = int(input("Select an option (1-7): "))
		if choice == 1:
			cad_select_dim()
		elif choice == 2:
			cad_select_hatch()
		elif choice == 3:
			cad_select_block()
		elif choice == 4:
			cad_select_polyline()
		elif choice == 5:
			cad_select_mleader()				
		elif choice == 7:
			write_point_to_txt(point_cad)
			break
		else:
			print("wrong input, Exist.")
			break

main()

print("complete! ")