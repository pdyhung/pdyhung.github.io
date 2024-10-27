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

def cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter):
	toa_do_x_list = []
	toa_do_y_list = []
	toa_do_list = []
	ac_dim = []
	for i in cad_block:
		if i.ObjectName == "AcDbBlockReference":
			toa_do_x_list.append(i.InsertionPoint[0])
			toa_do_y_list.append(i.InsertionPoint[1])
			toa_do_list.append([i.InsertionPoint[0],i.InsertionPoint[1]])
		else:
			pass
	if dim_verter == "y":
		toa_do_list.sort(key=lambda l:l[1])
	else:
		toa_do_list.sort(key=lambda m:m[0])
	for i in range(len(toa_do_list)-1):
		ac_line = acadModel.AddLine(APoint(toa_do_list[i][0], toa_do_list[i][1]), APoint(toa_do_list[i+1][0], toa_do_list[i+1][1]))
		alpha = ac_line.Angle + math.pi / 2 + dim_Angle
		ac_line.delete()
		text_dim_pos_x = toa_do_list[i][0] + math.cos(alpha)*dim_distance
		text_dim_pos_y = toa_do_list[i][1] + math.sin(alpha)*dim_distance
		ac_dim.append(acadModel.AddDimAligned(APoint(toa_do_list[i][0], toa_do_list[i][1]), APoint(toa_do_list[i+1][0], toa_do_list[i+1][1]), APoint(text_dim_pos_x, text_dim_pos_y)))
	return ac_dim

def show_menu():
	print("......")
	print("WROTE BY PHẠM VĂN HƯNG IN 2023 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
	print("option 1: Dim block: ")
	print("option 2: Draw polyline base point block: ")
	print("option 3: --> EXIT <-- ")
	print("......")

def main():
	while True:
		show_menu()
		choice = input("Select an option (1-2): ")
		if choice == "1":
			print("Chọn block: ")
			cad_block = cad_select_object()
			dim_verter = input("Lọc Block theo phương (x or y): ")
			dim_Angle = 0
			dim_distance = float(input("Nhập khoảng cách từ block tới dim text: "))
			ac_dim = cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter)
			dim_check = input("Có xoay dim không (y/n): ")
			if dim_check == "y":
				for i in range(len(ac_dim)):
					ac_dim[i].delete()
				dim_Angle = math.pi
				cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter)
			else:
				pass
		else:
			break

main()

print("complete! ")