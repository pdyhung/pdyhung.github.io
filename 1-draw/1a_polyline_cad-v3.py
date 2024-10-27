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

a = Autocad(create_if_not_exists = True, visible = False)

class Polyline_cad:
	def __init__(self, x_list, y_list, z_list):
		self.x_list = x_list
		self.y_list = y_list
		self.z_list = z_list

def read_polyline_cad():
	b = cad_select_object()
	for i in b:
		toa_do = i.Coordinates
		toa_do = str(toa_do).strip("(").strip(")")
		coordinates_list = toa_do.split(",")
	toa_do_x = []
	toa_do_y = []
	toa_do_z = []
	for i in range(0, len(coordinates_list),2):
		toa_do_x.append(coordinates_list[i])
	for i in range(1, len(coordinates_list),2):
		toa_do_y.append(coordinates_list[i])
		toa_do_z.append(str(0) + "\n")
	polyline_cad = Polyline_cad(toa_do_x, toa_do_y, toa_do_z)
	return polyline_cad

def print_polyline_cad(polyline_cad):
	for i in range(len(polyline_cad.x_list)):
		print("Toa do x" + str(i) + ": ", polyline_cad.x_list[i])
		print("Toa do y" + str(i) + ": ", polyline_cad.y_list[i])
		print("Toa do z" + str(i) + ": ", polyline_cad.z_list[i], end="")	

def write_cad_csv_polyline(polyline_cad):
	x = polyline_cad.x_list
	y = polyline_cad.y_list
	with open("toa_do_cad.csv", mode="w") as file_new:
		for j in range(len(x)):
			a1 = '{0:.{1}f}'.format(float(x[j]),3)
			a2 = '{0:.{1}f}'.format(float(y[j]),3)
			file_new.write(str(a2)+ "," + str(a1) + "\n")

def draw_text_with_polyline(polyline_cad):
	print("Số thứ tự bắt đầu là: ")
	stt = int(input())
	x = polyline_cad.x_list
	y = polyline_cad.y_list
	for j in range(len(x)):
		a1 = '{0:.{1}f}'.format(float(x[j]),3)
		a2 = '{0:.{1}f}'.format(float(y[j]),3)
		# a.model.AddText(str(j+stt) + " , x=" + str(a2)+ " ,y=" + str(a1), APoint(x[j]+1,y[j]+1), 2)
		a.model.AddText(str(j+stt), APoint(float(x[j])+1,float(y[j])+1), 2)


def show_menu():
	print("......")
	print("option 1: chon diem polyline trong autocad: ")
	print("option2: show toa do diem polyline: ")
	print("option3: work: ")
	print("option4: add polyline: ")
	print("option5: update polyline")
	print("option6: remove polyline")
	print("option7: save and exit")
	print("......")


def write_polyline_to_txt(polyline_cad):
	with open("data_polyline.txt", "w") as file:
		for i in range(len(polyline_cad.x_list)):
			file.write(str(polyline_cad.x_list[i] + "," + polyline_cad.y_list[i] + "," + polyline_cad.z_list[i]).replace(" ", ""))

def read_polyline_cad_from_txt():
	polyline_cad_x = []
	polyline_cad_y = []
	polyline_cad_z = []
	with open("data_polyline.txt", "r") as file:
		toa_do = file.readline()
		while toa_do != "":
			polyline_cad_in = toa_do.split(",")
			polyline_cad_x.append(polyline_cad_in[0])
			polyline_cad_y.append(polyline_cad_in[1])
			polyline_cad_z.append(polyline_cad_in[2])
			toa_do = file.readline()
	polyline_cad = Polyline_cad(polyline_cad_x, polyline_cad_y, polyline_cad_z)
	return polyline_cad

def work_polyline(polyline_cad):
	# total = len(polyline_cad.x)
	# choice = seleck_in_range("Chon vi tri can work (1," + str(total) + "): ", 1, total)
	# print("Open polyline " + polyline_cad.x[choice-1] + ", " + polyline_cad.y[choice-1] + ", " + polyline_cad.z[choice-1], end="")
	draw_text_with_polyline(polyline_cad)
	write_cad_csv_polyline(polyline_cad)

def seleck_in_range(prompt, min, max):
	choice = input(prompt)
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice

def main():

	try:
		polyline_cad = read_polyline_cad_from_txt()
		print("loaded data successfully !!!")
	except:
		print("welcome first user !!!")

	while True:
		show_menu()
		choice = int(input("Select an option (1-7): "))
		if choice == 1:
			polyline_cad = read_polyline_cad()
		elif choice == 2:
			print_polyline_cad(polyline_cad)
		elif choice == 3:
			work_polyline(polyline_cad)
		# elif choice == 4:
		# 	add_polyline(polyline_cad)
		# elif choice == 5:
		# 	polyline_cad = update_polyline(polyline_cad)
		# elif choice == 6:
		# 	polyline_cad = remove_polyline(polyline_cad)
		elif choice == 7:
			write_polyline_to_txt(polyline_cad)
			break
		else:
			print("wrong input, Exist.")
			break

main()

print("hoàn thành")