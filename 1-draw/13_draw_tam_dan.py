import math
import win32com.client
import pythoncom
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

def APoint(x, y, z):
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

def draw_cover(pxs,pys):
	p_distances = []
	p_num = len(pxs)
	print(pxs,pys)
	print(p_num)
	for i in range(p_num):
		p_distances.append( math.sqrt( pow((pxs[i] - pxs[i-1]),2) + pow((pys[i] - pys[i-1]),2) ) )
	print(p_distances)

def draw_theps():
	print("select polyline")
	cover = cad_select_object()
	coords = cover[0].Coordinates
	pxs = []
	pys = []
	for i in range(0,len(coords)-1,2):
		pxs.append(coords[i]) 
		pys.append(coords[i+1]) 
	draw_cover(pxs,pys)


def show_menu():
	print("......")
	print("WROTE BY PHẠM VĂN HƯNG IN 2024 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
	print("......")
	print("option 1: select polyline in autocad: ")

def main():

	while True:
		show_menu()
		choice = int(input("Select an option (1-7): "))
		if choice == 1:
			draw_theps()
		else:
			break

main()

print("hoàn thành")