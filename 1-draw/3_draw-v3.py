from pyautocad import Autocad, APoint, aDouble
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

class Point_cad:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

class Cirle_cad:
	def __init__(self, x, y, z, r):
		self.x = x
		self.y = y
		self.z = z
		self.r = r

def read_point_cad():
	point_cad_x = []
	point_cad_y = []
	point_cad_z = []
	b = cad_select_object()
	for i in b:
		toa_do = i.Coordinates
		toa_do = str(toa_do).strip("(").strip(")")
		toa_do_list = toa_do.split(",")
		point_cad_x.append(toa_do_list[0])
		point_cad_y.append(toa_do_list[1])
		point_cad_z.append(toa_do_list[2]+ "\n")
	point_cad = Point_cad(point_cad_x, point_cad_y, point_cad_z)
	return point_cad

def print_point_cad(point_cad):
	for i in range(len(point_cad.x)):
		print("Toa do x: ", point_cad.x[i])
		print("Toa do y: ", point_cad.y[i])
		print("Toa do z: ", point_cad.z[i], end="")

def draw_cir():
	x = read_csv_cad(0)
	y = read_csv_cad(1)
	r = read_csv_cad(3)
	for i in range(len(x)):
		p = APoint(x[i],y[i])
		acadModel.AddCircle(p,r[i])

def draw_polyline(point_cad):
	x = point_cad.x
	y = point_cad.y
	z = point_cad.z
	toa_do = []
	for i in range(len(x)):
		toa_do.append(float(x[i]))
		toa_do.append(float(y[i]))
		toa_do.append(float(z[i]))
	b = aDouble(toa_do)
	acadModel.AddPolyLine(b)

def draw_line(point_cad):
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)-1):
		acadModel.AddLine(APoint(float(x[j]),float(y[j])) ,APoint(float(x[j+1]),float(y[j+1])))

def draw_point(point_cad):
	x = point_cad.x
	y = point_cad.y
	for i in range(len(x)):
		p_i = APoint(float(x[i]),float(y[i]))
		p1 = acadModel.AddPoint(p_i)


def draw_text_temp(stt,text_distance,text_angle_1,text_angle_2,x,y):
	ac_text_list = []
	for j in range(len(x) - 1):
		ac_line= acadModel.AddLine(APoint(x[j],y[j]), APoint(x[j+1], y[j+1]))
		alpha = ac_line.Angle + math.pi/2 + text_angle_1
		ac_line.Delete()
		text_pos_x = float(x[j]) + text_distance
		text_pos_y = float(y[j]) + text_distance
		ac_text = acadModel.AddText(str(j+stt), APoint(text_pos_x, text_pos_y), 2)
		# ac_text.Rotation = alpha - math.pi/2 + text_angle_2
		ac_text_list.append(ac_text)
	ac_line= acadModel.AddLine(APoint(x[-2],y[-2]), APoint(x[-1], y[-1]))
	alpha = ac_line.Angle + math.pi/2 + text_angle_1
	ac_line.Delete()
	text_pos_x = float(x[-1]) + text_distance
	text_pos_y = float(y[-1]) + text_distance
	ac_text = acadModel.AddText(str(len(x)+stt-1), APoint(text_pos_x, text_pos_y), 2)
	# ac_text.Rotation = alpha - math.pi/2 + text_angle_2
	ac_text_list.append(ac_text)
	return ac_text_list

def draw_text(point_cad):
	print("Số thứ tự bắt đầu là: ")
	stt = int(input())
	text_distance = float(input("nhập khoảng cách text: "))
	text_angle_1 = 0
	text_angle_2 = 0
	x = point_cad.x
	y = point_cad.y
	ac_text_list = draw_text_temp(stt,text_distance,text_angle_1,text_angle_2,x,y)
	text_pos_check = input("Có xoay vị trí text không? (y/n): ")
	if text_pos_check == "y":
		for i in range(len(ac_text_list)):
			ac_text_list[i].Delete()
		text_angle_1 = text_angle_1 + math.pi
		text_angle_2 = text_angle_2 + math.pi
		ac_text_list = draw_text_temp(stt,text_distance,text_angle_1,text_angle_2,x,y)
	else:
		pass
	text_check = input("Có quay text không? (y/n): ")
	if text_check == "y":
		for i in range(len(ac_text_list)):
			ac_text_list[i].Delete()
		text_angle_2 = text_angle_2 + math.pi
		ac_text_list = draw_text_temp(stt,text_distance,text_angle_1,text_angle_2,x,y)
	else:
		pass
	return ac_text_list

def draw_dim(point_cad):
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)-1):
		acadModel.AddDimAligned(APoint(float(x[j]),float(y[j])) ,APoint(float(x[j+1]),float(y[j+1])), APoint(float(x[j])-3,float(y[j])-3))

def draw_cirle(point_cad):
	point_cad_x = []
	point_cad_y = []
	point_cad_z = []
	point_cad_r = []

	with open("data_cirle.txt", "r") as file:
		data = file.readline()
		while data != "":
			data_new = data.split(",")
			point_cad_x.append(data_new[0])
			point_cad_y.append(data_new[1])
			point_cad_z.append(data_new[2])
			point_cad_r.append(data_new[3])
			data = file.readline()
	for i in range(len(point_cad_x)):
		acadModel.AddCircle(APoint(float(point_cad_x[i]), float(point_cad_y[i])), float(point_cad_r[i]))
	

def export_csv(point_cad):
	with open("data_point1.csv", "w", encoding="utf-8-sig") as file:
		file.write("TÊN ĐIỂM, TỌA ĐỘ X, TỌA ĐỘ Y" + "\n")
		for i in range(len(point_cad.x)):
			file.write(str(i+1) + "," + '{0:.{1}f}'.format(float(point_cad.y[i]),3) + "," + '{0:.{1}f}'.format(float(point_cad.x[i]),3) + "\n")

def show_menu():
	print("......")
	print("option 1: chon diem point trong autocad: ")
	print("option2: show toa do diem point: ")
	print("option31: draw point: ")
	print("option32: draw line: ")
	print("option33: draw polyline: ")
	print("option34: draw circle: ")
	print("option35: draw text: ")
	print("option352: delete text: ")
	print("option36: draw dim: ")
	print("option37: export csv: ")
	print("option41: add point index end: ")
	print("option42: add group point index: ")
	print("option5: update point")
	print("option61: remove point")
	print("option62: remove list point")
	print("option7: save and exit")
	print("......")

def write_point_to_txt(point_cad):
	with open("data.txt", "w") as file:
		for i in range(len(point_cad.x)):
			file.write(str(point_cad.x[i] + "," + point_cad.y[i] + "," + point_cad.z[i]).replace(" ", ""))

def read_point_cad_from_txt():
	point_cad_x = []
	point_cad_y = []
	point_cad_z = []
	with open("data.txt", "r") as file:
		toa_do = file.readline()
		while toa_do != "":
			point_cad_in = toa_do.split(",")
			point_cad_x.append(point_cad_in[0])
			point_cad_y.append(point_cad_in[1])
			point_cad_z.append(point_cad_in[2])
			toa_do = file.readline()
	point_cad = Point_cad(point_cad_x, point_cad_y, point_cad_z)
	return point_cad

def seleck_in_range(prompt, min, max):
	choice = input(prompt)
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice


def add_point(point_cad):
	print("Chon diem point can them: ")
	b = cad_select_object()
	for i in b:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		point_cad.x.append(new_toa_do_list[0])
		point_cad.y.append(new_toa_do_list[1])
		point_cad.z.append(new_toa_do_list[2] + "\n")
	return point_cad

def add_point_list(point_cad):
	point_index = int(input("Vị trí cần thêm list point: ")) - 1
	print("Select list point!")
	point_list_1 = cad_select_object()
	point_list_2_x = []
	point_list_2_y = []
	point_list_2_z = []
	for i in point_list_1:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		point_list_2_x.append(new_toa_do_list[0])
		point_list_2_y.append(new_toa_do_list[1])
		point_list_2_z.append(new_toa_do_list[2] + "\n")
	for i in range(len(point_list_2_x)):
		point_cad.x.insert(point_index + i, point_list_2_x[i])
		point_cad.y.insert(point_index + i, point_list_2_y[i])
		point_cad.z.insert(point_index + i, point_list_2_z[i])
	return point_cad


def update_point(point_cad):
	total = len(point_cad.x)
	choice = seleck_in_range("update point? (1," + str(total) + "): ", 1, total)
	b = cad_select_object()
	for i in b:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		point_cad.x[choice-1] = new_toa_do_list[0]
		point_cad.y[choice-1] = new_toa_do_list[1]
		point_cad.z[choice-1] = new_toa_do_list[2] + "\n"
	return point_cad


def remove_point(point_cad):
	total = len(point_cad.x)
	choice = seleck_in_range("remove point? (1," + str(total) + "): ", 1, total)
	new_point_x_list = []
	new_point_y_list = []
	new_point_z_list = []
	for i in range(total):
		if i == choice-1:
			continue
		new_point_x_list.append(point_cad.x[i])
		new_point_y_list.append(point_cad.y[i])
		new_point_z_list.append(point_cad.z[i])
	point_cad.x = new_point_x_list
	point_cad.y = new_point_y_list
	point_cad.z = new_point_z_list
	return point_cad

def remove_point_list(point_cad):
	total = len(point_cad.x)	
	choice_begin = seleck_in_range("Remove index begin point? (1," + str(total) + "): ", 1, total)
	choice_end = seleck_in_range("Remove index end point? (1," + str(total) + "): ", 1, total)
	new_point_x_list = []
	new_point_y_list = []
	new_point_z_list = []
	for i in range(total):
		if i >= choice_begin-1 and i <= choice_end-1:
			continue
		new_point_x_list.append(point_cad.x[i])
		new_point_y_list.append(point_cad.y[i])
		new_point_z_list.append(point_cad.z[i])
	point_cad.x = new_point_x_list
	point_cad.y = new_point_y_list
	point_cad.z = new_point_z_list
	return point_cad	

def main():

	try:
		point_cad = read_point_cad_from_txt()
		print("loaded data successfully !!!")
	except:
		print("welcome first user !!!")

	while True:
		show_menu()
		choice = int(input("Select an option (1-7): "))
		if choice == 1:
			point_cad = read_point_cad()
		elif choice == 2:
			print_point_cad(point_cad)
		elif choice == 31:
			draw_point(point_cad)
		elif choice == 32:
			draw_line(point_cad)
		elif choice == 33:
			draw_polyline(point_cad)			
		elif choice == 34:
			draw_cirle(point_cad)
		elif choice == 35:
			text_list = draw_text(point_cad)
		elif choice == 352:
			for k in range(len(text_list)):
				text_list[k].Delete()
		elif choice == 36:
			draw_dim(point_cad)
		elif choice == 37:
			export_csv(point_cad)			
		elif choice == 41:
			add_point(point_cad)
		elif choice == 42:
			add_point_list(point_cad)			
		elif choice == 5:
			point_cad = update_point(point_cad)
		elif choice == 61:
			point_cad = remove_point(point_cad)
		elif choice == 62:
			point_cad = remove_point_list(point_cad)			
		elif choice == 7:
			write_point_to_txt(point_cad)
			break
		else:
			print("wrong input, Exist.")
			break

main()

print("hoàn thành")