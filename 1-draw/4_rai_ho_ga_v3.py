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
	def __init__(self, x_list, y_list, z_list, blk_current, pl1, x0, y0, z0, blk_name):
		self.x_list = x_list
		self.y_list = y_list
		self.z_list = z_list
		self.blk_current = blk_current
		self.pl1 = pl1
		self.x0 = x0
		self.y0 = y0
		self.z0 = z0
		self.blk_name = blk_name

a = Autocad(create_if_not_exists = True, visible = False)

def APoint(x, y, z=0):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (x, y, z))

def aDouble(xyz):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (xyz))

def aVariant(vObject):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_DISPATCH, (vObject))

def cad_select_dim():
	with open("data_distance_structure.txt", mode="w") as file:
		b = cad_select_object()
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
	pl2_list_x = []
	pl2_list_y = []
	pl2_list_z = []
	blk_current_list = []
	print("Chon diem dau tien")
	p2 = acad_Doc.Utility.GetPoint()
	x1 = p2[0]
	y1 = p2[1]
	p1 = APoint(x1, y1, 0)
	base_point_block_x = x1
	base_point_block_y = y1
	base_point_block_z = 0
	print("Chon polyline can rai block")	
	ac_polyline_base = cad_select_object()
	print("Chon block can rai")
	ac_block = acad_Doc.Utility.GetEntity()
	block_name = ac_block[0].name
	with open("data_distance_structure.txt", mode="r") as file:
		ban_kinh = file.readline()
		for i in ac_polyline_base:
			pl1 = i
			blk_current_list.append(acadModel.InsertBlock(p1 , block_name, 1, 1, 1, 0))
			pl2_list_x.append(base_point_block_x)
			pl2_list_y.append(base_point_block_y)
			pl2_list_z.append(base_point_block_z)
			while ban_kinh != "":
				c = acadModel.AddCircle(p1, float(ban_kinh))
				p = i.IntersectWith(c, 0)
				c.Delete()
				if len(p) == 3:
					base_point_block_x = p[0]
					base_point_block_y = p[1]
					base_point_block_z = p[2]
				elif math.sqrt(pow((p[0]-x1),2) + pow(p[1]-y1,2)) > math.sqrt(pow((p[3]-x1),2) + pow((p[4]-y1),2)):
					base_point_block_x = p[0]
					base_point_block_y = p[1]
					base_point_block_z = p[2]
				else:					
					base_point_block_x = p[3]
					base_point_block_y = p[4]
					base_point_block_z = p[5]
				p1 = APoint(base_point_block_x, base_point_block_y, base_point_block_z)
				blk_current_list.append(acadModel.InsertBlock(p1 , block_name, 1, 1, 1, 0))
				pl2_list_x.append(base_point_block_x)
				pl2_list_y.append(base_point_block_y)
				pl2_list_z.append(base_point_block_z)
				ban_kinh = file.readline()
		ac_points_blks = Ac_point_block(pl2_list_x, pl2_list_y, pl2_list_z, blk_current_list, pl1, p2[0], p2[1], 0, block_name)
	return ac_points_blks

def rai_lai_ho_ga(ac_points_blks):
	for j in range(len(ac_points_blks.blk_current)):
		ac_points_blks.blk_current[j].Delete()
	pl2_list_x = []
	pl2_list_y = []
	pl2_list_z = []
	blk_current_list = []
	x1 = ac_points_blks.x0
	y1 = ac_points_blks.y0
	p1 = APoint(x1, y1, 0)
	base_point_block_x = x1
	base_point_block_y = y1
	base_point_block_z = 0
	ac_polyline_base = ac_points_blks.pl1
	block_name = ac_points_blks.blk_name
	with open("data_distance_structure.txt", mode="r") as file:
		ban_kinh = file.readline()
		pl1 = ac_points_blks.pl1
		blk_current_list.append(acadModel.InsertBlock(p1 , block_name, 1, 1, 1, 0))
		pl2_list_x.append(base_point_block_x)
		pl2_list_y.append(base_point_block_y)
		pl2_list_z.append(base_point_block_z)
		while ban_kinh != "":
			c = acadModel.AddCircle(p1, float(ban_kinh))
			p = pl1.IntersectWith(c, 0)
			c.Delete()
			if len(p) == 3:
				base_point_block_x = p[0]
				base_point_block_y = p[1]
				base_point_block_z = p[2]
			elif math.sqrt(pow((p[0]-x1),2) + pow(p[1]-y1,2)) > math.sqrt(pow((p[3]-x1),2) + pow((p[4]-y1),2)):
				base_point_block_x = p[0]
				base_point_block_y = p[1]
				base_point_block_z = p[2]
			else:					
				base_point_block_x = p[3]
				base_point_block_y = p[4]
				base_point_block_z = p[5]
			p1 = APoint(base_point_block_x, base_point_block_y, base_point_block_z)
			blk_current_list.append(acadModel.InsertBlock(p1 , block_name, 1, 1, 1, 0))
			pl2_list_x.append(base_point_block_x)
			pl2_list_y.append(base_point_block_y)
			pl2_list_z.append(base_point_block_z)
			ban_kinh = file.readline()
		ac_points_blks = Ac_point_block(pl2_list_x, pl2_list_y, pl2_list_z, blk_current_list, pl1, ac_points_blks.x0, ac_points_blks.y0, 0, block_name)
	return ac_points_blks

def draw_polyline_from_block(ac_points_blks):
	x = ac_points_blks.x
	y = ac_points_blks.y
	z = ac_points_blks.z
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
	print("option 21: Draw block import txt! ")
	print("option 22: reDraw block import txt! ")
	print("option 3: Draw polyline from block ")
	print("option 4: --> EXIT <-- ")
	print("......")

def main():
	while True:
		show_menu()
		choice = input("Select an option (1-4): ")
		if choice == "1":	
			cad_select_dim()
		elif choice == "21":
			ac_points_blks = rai_ho_ga()
		elif choice == "22":
			ac_points_blks = rai_lai_ho_ga(ac_points_blks)
		elif choice == "3":
			draw_polyline_from_block(ac_points_blks)	
		else:
			break

main()

print("complete! ")