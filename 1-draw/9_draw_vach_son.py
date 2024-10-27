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

def taluy_draw(base_point, delta_point, x0, y0):
	if len(delta_point) == 3:
		line_delta = acadModel.AddLine(base_point, APoint(delta_point[0], delta_point[1]))
		line_delta.Rotate(base_point, math.pi/2)
	elif math.sqrt(pow((delta_point[0]-x0),2) + pow(delta_point[1]-y0,2)) > math.sqrt(pow((delta_point[3]-x0),2) + pow((delta_point[4]-y0),2)):
		line_delta = acadModel.AddLine(base_point, APoint(delta_point[0], delta_point[1]))
		line_delta.Rotate(base_point, math.pi/2)
	else:
		line_delta = acadModel.AddLine(base_point, APoint(delta_point[3], delta_point[4]))
		line_delta.Rotate(base_point, math.pi/2)
	return line_delta

def rai_taluy_dao(t, a1, h, cad_pl_2, p_0, cad_pl_1):
	x0 = p_0[0]
	y0 = p_0[1]
	cad_p0 = APoint(x0, y0, 0)
	point_1_list = []  # list point large
	cad_pl_len = cad_pl_1[0].Length
	cad_pl_count = math.trunc(cad_pl_len/a1)
	for i in range(cad_pl_count+1):
		if (i % h) == 0:
			n = 1
		else:
			n = t
		cad_cir_1 = acadModel.AddCircle(cad_p0, float(a1))
		c_delta = acadModel.AddCircle(cad_p0, 0.05)
		p = cad_pl_1[0].IntersectWith(cad_cir_1, 0)
		p_delta = cad_pl_1[0].IntersectWith(c_delta, 0)
		cad_cir_1.Delete()
		c_delta.Delete()
		if len(p) == 3:
			d_line = taluy_draw(cad_p0, p_delta, x0, y0)
			for k in range(len(cad_pl_2)):
				try:
					p_line = d_line.IntersectWith(cad_pl_2[k], 1)
					taluy_line_1 = acadModel.AddLine(cad_p0, APoint(p_line[0], p_line[1]))
					taluy_line_2_angle = taluy_line_1.Angle + math.pi
					taluy_line_2_r = (n)*taluy_line_1.Length
					taluy_line_2 = acadModel.AddLine(APoint(p_line[0], p_line[1]), APoint(p_line[0] + taluy_line_2_r*math.cos(taluy_line_2_angle), p_line[1] + taluy_line_2_r*math.sin(taluy_line_2_angle)))
					taluy_line_1.Delete()
				except:
					pass
			cad_p0 = APoint(p[0], p[1], p[2])
			d_line.Delete()
		elif math.sqrt(pow((p[0]-x0),2) + pow(p[1]-y0,2)) > math.sqrt(pow((p[3]-x0),2) + pow((p[4]-y0),2)):
			d_line = taluy_draw(cad_p0, p_delta, x0, y0)
			for k in range(len(cad_pl_2)):
				try:
					p_line = d_line.IntersectWith(cad_pl_2[k], 1)
					taluy_line_1 = acadModel.AddLine(cad_p0, APoint(p_line[0], p_line[1]))
					taluy_line_2_angle = taluy_line_1.Angle + math.pi
					taluy_line_2_r = (n)*taluy_line_1.Length
					taluy_line_2 = acadModel.AddLine(APoint(p_line[0], p_line[1]), APoint(p_line[0] + taluy_line_2_r*math.cos(taluy_line_2_angle), p_line[1] + taluy_line_2_r*math.sin(taluy_line_2_angle)))
					taluy_line_1.Delete()
				except:
					pass
			cad_p0 = APoint(p[0], p[1], p[2])
			d_line.Delete()
		else:
			d_line = taluy_draw(cad_p0, p_delta, x0, y0)
			for k in range(len(cad_pl_2)):
				try:
					p_line = d_line.IntersectWith(cad_pl_2[k], 1)
					taluy_line_1 = acadModel.AddLine(cad_p0, APoint(p_line[0], p_line[1]))
					taluy_line_2_angle = taluy_line_1.Angle + math.pi
					taluy_line_2_r = (n)*taluy_line_1.Length
					taluy_line_2 = acadModel.AddLine(APoint(p_line[0], p_line[1]), APoint(p_line[0] + taluy_line_2_r*math.cos(taluy_line_2_angle), p_line[1] + taluy_line_2_r*math.sin(taluy_line_2_angle)))
					taluy_line_1.Delete()			
				except:
					pass
			cad_p0 = APoint(p[3], p[4], p[5])
			d_line.Delete()

def show_menu():
	print("......")
	print("WROTE BY PHAM VAN HUNG IN 2024 ___CA DOAN G.X VUNG TAU___ S2")
	print("option 1: ve vach son: ")
	print("option 2: --> EXIT <-- ")
	print("......")

def main():
	while True:
		show_menu()
		choice = int(input("Select an option (1-2): "))

		if choice == 1:
			t = float(input("ty le danh taluy (1/x): "))
			a1 = float(input("khoang cach danh taluy: "))
			h = float(input("number taluy con taluy: ")) + 1
			print("pick diem dau")
			p_0 = acad_Doc.Utility.GetPoint()
			print("pick vai duong")
			cad_pl_1 = acad_Doc.Utility.GetEntity()
			cad_pl_2 = []
			print("pick chan taluy")
			cad_pl_2_temp = cad_select_object()			
			for j in cad_pl_2_temp:
				cad_pl_2.append(j)
			rai_taluy_dao(t, a1, h, cad_pl_2, p_0, cad_pl_1)

		elif choice == 2:
			break
		else:
			print("wrong input, Exist.")
			break

main()

print("complete! ")