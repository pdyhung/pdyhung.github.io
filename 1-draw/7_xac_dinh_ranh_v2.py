from pyautocad import Autocad
import math
import win32com.client
import pythoncom
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

class Ac_point:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

class Ac_point_block:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

a = Autocad(create_if_not_exists = True, visible = False)

def APoint(x, y, z=0):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (x, y, z))

def aDouble(xyz):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (xyz))

def aVariant(vObject):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_DISPATCH, (vObject))

def cad_select_dim():
	with open("data_distance_structure.txt", mode="w") as file:
		b = a.get_selection()
		for i in b:
			c = i.Measurement
			file.write(str(round(c,2)) + "\n")

def cad_select_object():
	try:
		acad_Doc.SelectionSets.Item("SS1").Delete()
	except:
		print("Delete selection failed")
	ssetObj = acad_Doc.SelectionSets.Add("SS1")
	ssetObj.SelectOnScreen()
	return ssetObj

def rai_ho_ga():
	lr1 = []
	lb1 = []
	pl2_list_x = []
	pl2_list_y = []
	pl2_list_z = []
	b1_list = []
	pl0_list_x = []
	pl0_list_y = []
	print("Chon diem dau tien")
	p0 = acad_Doc.Utility.GetPoint()
	x0 = p0[0]
	y0 = p0[1]
	ac_p0 = APoint(x0, y0, 0)
	print("Chon polyline can rai block")	
	ac_polyline_base = cad_select_object()
	with open("7_4_list_data_ld_r1.csv", mode="r") as file2:
		data_2 = file2.readline()
		while data_2 != "":
			b1_list = data_2.split(",")
			lr1.append(b1_list[0])
			lb1.append(b1_list[1])
			data_2 = file2.readline()
	for i in ac_polyline_base:
		for j in range(len(lr1)-1):
			c = acadModel.AddCircle(ac_p0, float(lr1[j]))
			p1 = i.IntersectWith(c, 0)
			c.Delete()
			if len(p1) == 3:
				p4_x = p1[0]
				p4_y = p1[1]
				p4_z = p1[2]
			elif math.sqrt(pow((p1[0]-x0),2) + pow(p1[1]-y0,2)) > math.sqrt(pow((p1[3]-x0),2) + pow((p1[4]-y0),2)):
				p4_x = p1[0]
				p4_y = p1[1]
				p4_z = p1[2]					
			else:
				p4_x = p1[3]
				p4_y = p1[4]
				p4_z = p1[5]
			r_delta = 0.004
			ac_p4 = APoint(p4_x,p4_y,p4_z)
			c_delta = acadModel.AddCircle(ac_p4, r_delta)
			p5 = i.IntersectWith(c_delta, 0)
			c_delta.Delete()
			if len(p5) == 3:
				p8_x = p5[0]
				p8_y = p5[1]
				p8_z = p5[2]
			elif math.sqrt(pow((p5[0]-x0),2) + pow(p5[1]-y0,2)) > math.sqrt(pow((p5[3]-x0),2) + pow((p5[4]-y0),2)):
				p8_x = p5[0]
				p8_y = p5[1]
				p8_z = p5[2]					
			else:
				p8_x = p5[3]
				p8_y = p5[4]
				p8_z = p5[5]	
			ac_p8 = APoint(p8_x,p8_y,p8_z)
			ac_l1 = acadModel.AddLine(ac_p4, ac_p8)
			angle_1 = ac_l1.Angle - math.pi/2
			ac_l1.Delete()
			pl2_list_x.append(float(lb1[j])*math.cos(angle_1) + p4_x)
			pl2_list_y.append(float(lb1[j])*math.sin(angle_1) + p4_y)
			pl2_list_z.append(0)
			ac_p0 = APoint(p4_x, p4_y, 0)
			pl0_list_x.append(p4_x)
			pl0_list_y.append(p4_y)
			if j > 0:
				x0 = pl0_list_x[j-1]
				y0 = pl0_list_y[j-1]
		ac_points = Ac_point(pl2_list_x,pl2_list_y,pl2_list_z)
		print(pl2_list_y)
	return ac_points

def draw_polyline_from_block(ac_points):
	x = ac_points.x
	y = ac_points.y
	z = ac_points.z
	toa_do = []
	for i in range(len(x)):
		toa_do.append(float(x[i]))
		toa_do.append(float(y[i]))
		toa_do.append(float(z[i]))
	b = aDouble(toa_do)
	acadModel.AddPolyLine(b)	

def show_menu():
	print("......")
	print("WROTE BY PHẠM VĂN HƯNG IN 2023 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
	print("option 1: select dim --> export txt! ")
	print("option 2: Draw block import txt! ")
	print("option 3: Draw polyline from block ")
	print("option 4: --> EXIT <-- ")
	print("......")

def main():
	while True:
		show_menu()
		choice = input("Select an option (1-2): ")
		if choice == "1":	
			cad_select_dim()
		elif choice == "2":
			ac_points = rai_ho_ga()
		elif choice == "3":
			draw_polyline_from_block(ac_points)	
		else:
			break

main()

print("complete! ")