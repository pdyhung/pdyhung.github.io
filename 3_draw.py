from pyautocad import Autocad, APoint, aDouble

a = Autocad(create_if_not_exists = True, visible = False)

class Point_cad:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

def read_point_cad():
	point_cad_x = []
	point_cad_y = []
	point_cad_z = []
	b = a.get_selection()
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
		a.model.AddCircle(p,r[i])

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
	a.model.AddPolyLine(b)

def draw_line(point_cad):
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)-1):
		a.model.AddLine(APoint(float(x[j]),float(y[j])) ,APoint(float(x[j+1]),float(y[j+1])))

def draw_point(point_cad):
	x = point_cad.x
	y = point_cad.y
	for i in range(len(x)):
		p_i = APoint(float(x[i]),float(y[i]))
		p1 = a.model.AddPoint(p_i)

def draw_text(point_cad):
	print("Số thứ tự bắt đầu là: ")
	stt = int(input())
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)):
		a1 = '{0:.{1}f}'.format(float(x[j]),3)
		a2 = '{0:.{1}f}'.format(float(y[j]),3)
		# a.model.AddText(str(j+stt) + " , x=" + str(a2)+ " ,y=" + str(a1), APoint(x[j]+1,y[j]+1), 2)
		a.model.AddText(str(j+stt), APoint(float(x[j])+1,float(y[j])+1), 2)

def draw_dim(point_cad):
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)-1):
		a.model.AddDimAligned(APoint(float(x[j]),float(y[j])) ,APoint(float(x[j+1]),float(y[j+1])), APoint(float(x[j])-3,float(y[j])-3))

def show_menu():
	print("......")
	print("option 1: chon diem point trong autocad: ")
	print("option2: show toa do diem point: ")
	print("option31: draw point: ")
	print("option32: draw line: ")
	print("option33: draw polyline: ")
	print("option34: draw circle: ")
	print("option35: draw text: ")
	print("option36: draw dim: ")
	print("option4: add point: ")
	print("option5: update point")
	print("option6: remove point")
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
	b = a.get_selection()
	for i in b:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		point_cad.x.append(new_toa_do_list[0])
		point_cad.y.append(new_toa_do_list[1])
		point_cad.z.append(new_toa_do_list[2] + "\n")
	return point_cad

def update_point(point_cad):
	total = len(point_cad.x)
	choice = seleck_in_range("update point? (1," + str(total) + "): ", 1, total)
	b = a.get_selection()
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
			draw_text(point_cad)
		elif choice == 35:
			draw_text(point_cad)
		elif choice == 36:
			draw_dim(point_cad)
		elif choice == 4:
			add_point(point_cad)
		elif choice == 5:
			point_cad = update_point(point_cad)
		elif choice == 6:
			point_cad = remove_point(point_cad)
		elif choice == 7:
			write_point_to_txt(point_cad)
			break
		else:
			print("wrong input, Exist.")
			break

main()

print("hoàn thành")