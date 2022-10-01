import pygame
from pyautocad import Autocad, APoint, aDouble

a = Autocad(create_if_not_exists = True, visible = False)

class Point_cad:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

class TextButton:
	def __init__(self, text, position):
		self.text = text
		self.position = position

	def is_mouse_on_text(self):
		mouse_x, mouse_y = pygame.mouse.get_pos()
		if mouse_x > self.position[0] and mouse_x < self.position[0] + self.text_box[2] and mouse_y > self.position[1] and mouse_y < self.position[1] + self.text_box[3]:
			return True
		else:
			return False

	def draw(self):
		font = pygame.font.SysFont("Segoe UI Black",15)
		text_render = font.render(self.text, True, (0,0,255))
		self.text_box = text_render.get_rect()

		if self.is_mouse_on_text() == True:
			text_render = font.render(self.text, True, (255,0,255))
			pygame.draw.line(screen, (255,0,255), (self.position[0], self.position[1] + self.text_box[3]), (self.position[0] + self.text_box[2], self.position[1] + self.text_box[3]))
		else:
			text_render = font.render(self.text, True, (0,255,0))

		screen.blit(text_render, self.position)

def read_point_from_txt():
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

def write_point_to_txt(point_cad):
	with open("data.txt", "w") as file:
		for i in range(len(point_cad.x)):
			file.write(str(point_cad.x[i] + "," + point_cad.y[i] + "," + point_cad.z[i]).replace(" ", ""))

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

def write_point_csv(point_cad):
	x1 = point_cad.x
	y1 = point_cad.y
	with open("toa_do_cad.csv", mode="w") as file_new:
		for j in range(len(x1)):
			a1 = '{0:.{1}f}'.format(float(x1[j]),3)
			a2 = '{0:.{1}f}'.format(float(y1[j]),3)
			file_new.write(str(a2)+ "," + str(a1) + "\n")

def seleck_in_range(prompt, min, max):
	choice = user_text_1
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice

def seleck_in_range_1(prompt, min, max):
	choice = user_text_2
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice

def seleck_in_range_2(prompt, min, max):
	choice = user_text_3
	while not choice.isdigit() or int(choice) < min or int(choice) > max :
		choice = input(prompt)
	choice = int(choice)
	return choice

def draw_text_cad(point_cad):
	print("Số thứ tự bắt đầu là: ")
	stt = int(user_text_1)
	x = point_cad.x
	y = point_cad.y
	for j in range(len(x)):
		a1 = '{0:.{1}f}'.format(float(x[j]),3)
		a2 = '{0:.{1}f}'.format(float(y[j]),3)
		# a.model.AddText(str(j+stt) + " , x=" + str(a2)+ " ,y=" + str(a1), APoint(x[j]+1,y[j]+1), 2)
		a.model.AddText(str(j+stt), APoint(float(x[j])+1,float(y[j])+1), 2)

def work_point(point_cad):
	# total = len(point_cad.x)
	# choice = seleck_in_range("Chon vi tri can work (1," + str(total) + "): ", 1, total)
	# print("Open point " + point_cad.x[choice-1] + ", " + point_cad.y[choice-1] + ", " + point_cad.z[choice-1], end="")
	draw_text_cad(point_cad)

def add_point(point_cad):
	list1_x = []
	list1_y = []
	list1_z = []
	list2_x = []
	list2_y = []
	list2_z = []
	list_chen_x = []
	list_chen_y = []
	list_chen_z = []
	total = len(point_cad.x)
	i_chen = seleck_in_range("Chon vi tri add point? (1," + str(total) + "): ", 1, total)
	for i in range(i_chen-1):
		list1_x.append(point_cad.x[i])
		list1_y.append(point_cad.y[i])
		list1_z.append(point_cad.z[i])
	for i in range(i_chen, total):
		list2_x.append(point_cad.x[i])
		list2_y.append(point_cad.y[i])
		list2_z.append(point_cad.z[i])

	print("Chon diem point can them: ")
	b = a.get_selection()
	for i in b:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		list_chen_x.append(new_toa_do_list[0])
		list_chen_y.append(new_toa_do_list[1])
		list_chen_z.append(new_toa_do_list[2] + "\n")
	point_cad.x = list1_x + list_chen_x + list2_x
	point_cad.y = list1_y + list_chen_y + list2_y
	point_cad.z = list1_z + list_chen_z + list2_z
	return point_cad

def update_point(point_cad):
	total = len(point_cad.x)
	choice = seleck_in_range("chon vi tri can update point? (1," + str(total) + "): ", 1, total)
	b = a.get_selection()
	list1_x = []
	list1_y = []
	list1_z = []
	list2_x = []
	list2_y = []
	list2_z = []
	list_update_x = []
	list_update_y = []
	list_update_z = []
	for i in range(choice-1):
		list1_x.append(point_cad.x[i])
		list1_y.append(point_cad.y[i])
		list1_z.append(point_cad.z[i])
	for i in b:
		new_toa_do = i.Coordinates
		new_toa_do = str(new_toa_do).strip("(").strip(")")
		new_toa_do_list = new_toa_do.split(",")
		list_update_x.append(new_toa_do_list[0])
		list_update_y.append(new_toa_do_list[1])
		list_update_z.append(new_toa_do_list[2] + "\n")

	for i in range(choice-1 + len(list_update_x), total):
		list2_x.append(point_cad.x[i])
		list2_y.append(point_cad.y[i])
		list2_z.append(point_cad.z[i])
	point_cad.x = list1_x + list_update_x + list2_x
	point_cad.y = list1_y + list_update_y + list2_y
	point_cad.z = list1_z + list_update_z + list2_z
	return point_cad

def remove_point(point_cad):
	total = len(point_cad.x)
	vi_tri_dau = seleck_in_range_1("remove point vi tri dau? (1," + str(total) + "): ", 1, total)
	vi_tri_cuoi = seleck_in_range_2("remove point vi tri cuoi? (1," + str(total) + "): ", 1, total)
	new_point_x_list = []
	new_point_y_list = []
	new_point_z_list = []
	for i in range(total):
		if vi_tri_dau-1 <= i <= vi_tri_cuoi-1:
			continue
		new_point_x_list.append(point_cad.x[i])
		new_point_y_list.append(point_cad.y[i])
		new_point_z_list.append(point_cad.z[i])
	point_cad.x = new_point_x_list
	point_cad.y = new_point_y_list
	point_cad.z = new_point_z_list
	return point_cad

pygame.init()
screen = pygame.display.set_mode((500,600))
pygame.display.set_caption("Point cad by pdyhung")
clock = pygame.time.Clock()
running = True

try:
	point_cad = read_point_from_txt()
	print("loaded data successfully !!!")
except:
	print("welcome first user !!!")

pass_program = TextButton("pass: ", (50,25))

pick_point_cad = TextButton("Pick point cad! ", (50,50))
in_put_text = TextButton("Input number: ", (50,75))
add_text_cad = TextButton("Draw text cad! ", (50,100))
add_point_pygame = TextButton("Add point! ", (50,125))
cad_to_txt = TextButton("Save txt! ", (50,500))
update_point_pygame = TextButton("Update point! ", (50,150))
remove_point_pygame = TextButton("Remove point! ", (50,225))
remove_first_index = TextButton("Remove point first index: ", (50,175))
remove_last_index = TextButton("Remove point last index: ", (50,200))
cad_to_csv_pygame = TextButton("export csv! ", (50,275))

thoat = TextButton("Exit!", (250,525))

user_text_1 = ""
user_text_2 = ""
user_text_3 = ""
user_text_pass = ""

active_1 = False
active_2 = False
active_3 = False
active_pass = False

background_image = pygame.image.load("trang1.jpg")
background_image = pygame.transform.scale(background_image,(500,600))

while running:
	clock.tick(60)
	screen.fill((255,255,255))
	screen.blit(background_image, (0,0))

	pass_program.draw()

	pick_point_cad.draw()
	thoat.draw()
	add_text_cad.draw()
	in_put_text.draw()
	add_point_pygame.draw()
	update_point_pygame.draw()
	remove_point_pygame.draw()
	remove_first_index.draw()
	remove_last_index.draw()
	cad_to_csv_pygame.draw()

	cad_to_txt.draw()


	for event in pygame.event.get():

		if event.type == pygame.MOUSEBUTTONDOWN:
			if event.button == 1:
				if pass_program.is_mouse_on_text() == True:
					active_pass = True
				elif thoat.is_mouse_on_text() == True:
					active_pass = False
					if user_text_pass != "Pham Van Hung":
						running = False

		if event.type == pygame.KEYDOWN:
			if active_pass == True:
				if event.key == pygame.K_BACKSPACE:
					user_text_pass = user_text_pass[0:-1]
				else:
					user_text_pass += event.unicode


		if event.type == pygame.MOUSEBUTTONDOWN:
			if event.button == 1:

				if user_text_pass == "Pham Van Hung":

					if pick_point_cad.is_mouse_on_text() == True:
						point_cad = read_point_cad()
					elif add_text_cad.is_mouse_on_text() == True:
						work_point(point_cad)
					elif add_point_pygame.is_mouse_on_text() == True:
						add_point(point_cad)
					elif update_point_pygame.is_mouse_on_text() == True:
						point_cad = update_point(point_cad)
					elif remove_point_pygame.is_mouse_on_text() == True:
						point_cad = remove_point(point_cad)
					elif cad_to_csv_pygame.is_mouse_on_text() == True:
						point_cad = write_point_csv(point_cad)

					elif in_put_text.is_mouse_on_text() == True:
						active_1 = True
					elif remove_first_index.is_mouse_on_text() == True:
						active_2 = True
					elif remove_last_index.is_mouse_on_text() == True:
						active_3 = True

					elif thoat.is_mouse_on_text() == True:
						active_1 = False
						active_2 = False
						active_3 = False

					elif cad_to_txt.is_mouse_on_text() == True:
						write_point_to_txt(point_cad)


		if event.type == pygame.KEYDOWN:
			if active_1 == True:
				if event.key == pygame.K_BACKSPACE:
					user_text_1 = user_text_1[0:-1]
				else:
					user_text_1 += event.unicode

		if event.type == pygame.KEYDOWN:
			if active_2 == True:
				if event.key == pygame.K_BACKSPACE:
					user_text_2 = user_text_2[0:-1]
				else:
					user_text_2 += event.unicode

		if event.type == pygame.KEYDOWN:
			if active_3 == True:
				if event.key == pygame.K_BACKSPACE:
					user_text_3 = user_text_3[0:-1]
				else:
					user_text_3 += event.unicode

		if event.type == pygame.QUIT:
			running = False

	nhap_so = TextButton(user_text_1, (250,75))
	nhap_so.draw()

	chi_so_dau = TextButton(user_text_2, (250,175))
	chi_so_dau.draw()

	chi_so_cuoi = TextButton(user_text_3, (250,200))
	chi_so_cuoi.draw()

	pass_in_put = TextButton(user_text_pass, (250,25))
	pass_in_put.draw()

	writer = TextButton("Writed by Hung Pham in 1995", (250,575))
	writer.draw()

	pygame.display.flip()

pygame.quit()