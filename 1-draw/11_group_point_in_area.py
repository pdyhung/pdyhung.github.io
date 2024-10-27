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

def points_polyline():
	objects = cad_select_object()
	delta = 0.3
	x_deltas = []
	y_deltas = []
	z_deltas = []

	for ob in objects:	
		print(ob.EntityName)
		if ob.EntityName == "AcDbLine":
			p1 = ob.StartPoint
			p2 = ob.EndPoint
			line_length = ob.Length
			n = math.trunc(line_length/delta)
			for i in range(n):	
				x_deltas.append( delta*(i+1) * (p2[0] - p1[0]) / line_length + p1[0] )
				y_deltas.append( delta*(i+1) * (p2[1] - p1[1]) / line_length + p1[1] )
				z_deltas.append( delta*(i+1) * (p2[2] - p1[2]) / line_length + p1[2] )
				point = acadModel.AddPoint( APoint(x_deltas[-1],y_deltas[-1],z_deltas[-1]) )

		elif ob.EntityName == "AcDbArc":
			print(ob.EndAngle)
			print(ob.StartAngle)
			print(ob.ArcLength)
			print(ob.Radius)

			p0 = ob.Center
			alpha_arc = ob.EndAngle - ob.StartAngle
			arc_length = ob.ArcLength
			n = math.trunc(arc_length/delta)
			for i in range(n):
				alpha_delta = alpha_arc*delta*(i+1) / arc_length + ob.StartAngle
				x_deltas.append( p0[0] + math.cos(alpha_delta)*ob.Radius )
				y_deltas.append( p0[1] + math.sin(alpha_delta)*ob.Radius )
				z_deltas.append( 0 )
				point = acadModel.AddPoint( APoint(x_deltas[-1],y_deltas[-1],z_deltas[-1]) )


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
			points_polyline()
		# elif choice == 2:
		# 	print_point_cad(point_cad)

		else:
			break

main()

print("hoàn thành")