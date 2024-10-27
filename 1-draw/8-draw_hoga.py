from pyautocad import Autocad, APoint, aDouble
import pygame

import win32com.client
import pythoncom
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad.ActiveDocument.ModelSpace

a = Autocad(create_if_not_exists = True, visible = False)

class Hoga:
	def __init__(self, h_co, b_co, t, h_tam_dan_1 ,b_tam_dan_1 ,h_thanh , b_hoga, h_day, h_tam_dan_2, i_md):
		self.h_co = h_co
		self.b_co = b_co
		self.t = t
		self.h_tam_dan_1 = h_tam_dan_1
		self.b_tam_dan_1 = b_tam_dan_1
		self.h_thanh = h_thanh
		self.b_hoga = b_hoga
		self.h_day = h_day
		self.h_tam_dan_2 = h_tam_dan_2
		self.i_md = i_md

class Point_cad:
	def __init__(self, x, y):
		self.x = x
		self.y = y

class Point_cad_thanh_ho_ga:
	def __init__(self, x, y):
		self.x = x
		self.y = y


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


def draw_line(x_list, y_list):
	x = x_list
	y = y_list
	for j in range(len(x)-1):
		a.model.AddLine(APoint(x[j],y[j]) ,APoint(x[j+1],y[j+1]))

def hoga_input(user_text):
	h_co = float(user_text[0])
	b_co = float(user_text[1])
	t = float(user_text[2])
	h_tam_dan_1 = float(user_text[3])
	b_tam_dan_1 = float(user_text[4])
	h_thanh = float(user_text[5])
	b_hoga = float(user_text[6])
	h_day = float(user_text[7])
	h_tam_dan_2 = float(user_text[8])
	i_md = float(user_text[9])

	hoga = Hoga(h_co, b_co, t, h_tam_dan_1 ,b_tam_dan_1 ,h_thanh , b_hoga, h_day, h_tam_dan_2, i_md)

	return hoga

def p_append(point_cad, p_x, p_y):
	point_cad.x.append(p_x)
	point_cad.y.append(p_y)
	return point_cad

def p_append_1(point_cad_thanh_ho_ga, p_x, p_y):
	point_cad_thanh_ho_ga.x.append(p_x)
	point_cad_thanh_ho_ga.y.append(p_y)
	return point_cad_thanh_ho_ga

def add_a_point_cad():
	point_cad_x = []
	point_cad_y = []
	toa_do = acad_Doc.Utility.Getpoint()
	toa_do = str(toa_do).strip("(").strip(")")
	toa_do_list = toa_do.split(",")
	point_cad_x.append(toa_do_list[0])
	point_cad_y.append(toa_do_list[1])
	point_cad = Point_cad(point_cad_x, point_cad_y)
	return point_cad

def draw_co_ho_ga(hoga, point_cad):
# point 1
	p_x = float(point_cad.x[0]) + hoga.b_tam_dan_1/2
	p_y = float(point_cad.y[0])
	p_append(point_cad ,p_x, p_y)

# point 2
	p_x = float(point_cad.x[-1])
	p_y = float(point_cad.y[-1]) - hoga.h_tam_dan_1
	p_append(point_cad ,p_x, p_y)

# point 3
	p_x = float(point_cad.x[0]) + hoga.b_co/2
	p_y = float(point_cad.y[-1])
	p_append(point_cad ,p_x, p_y)

# point 4
	p_x = float(point_cad.x[-1])
	p_y = float(point_cad.y[-1]) - (hoga.h_co-hoga.h_tam_dan_1)
	p_append(point_cad ,p_x, p_y)

# point 5
	p_x = float(point_cad.x[-1]) + hoga.t
	p_y = float(point_cad.y[-1])
	p_append(point_cad ,p_x, p_y)

# point 6
	p_x = float(point_cad.x[-1])
	p_y = float(point_cad.y[-1]) + hoga.h_co
	p_append(point_cad ,p_x, p_y)

	p_append(point_cad ,float(point_cad.x[1]), float(point_cad.y[1]))

	x_list_1 = []
	y_list_1 = []

	x_list_2 = []
	y_list_2 = []

	x_list_3 = []
	y_list_3 = []

	x_list_4 = []
	y_list_4 = []

	# delta_1 = (hoga.i_md/100) * (hoga.b_co + 2*hoga.t)/2

	for i in range(len(point_cad.x)):
		if i == 4 or i == 5:
			x_list_1.append(float(point_cad.x[i]))
			y_list_1.append(float(point_cad.y[i]))
		else:
			x_list_1.append(float(point_cad.x[i]))
			y_list_1.append(float(point_cad.y[i]) + (hoga.i_md/100) * (float(point_cad.x[i])-float(point_cad.x[0])))
	draw_line(x_list_1, y_list_1)

	for i in range(len(x_list_1)):
		if i == 4 or i == 5:
			x_list_2_1 = 2*x_list_1[0] - x_list_1[i]
			x_list_2.append(x_list_2_1)
			y_list_2_1 = y_list_1[i]
			y_list_2.append(y_list_2_1)
		else:
			x_list_2_1 = 2*x_list_1[0] - x_list_1[i]
			x_list_2.append(x_list_2_1)
			y_list_2_1 = y_list_1[i] - 2*((hoga.i_md/100) * (x_list_1[i] - x_list_1[0]))
			y_list_2.append(y_list_2_1)

	draw_line(x_list_2, y_list_2)

	x_list_3.append(x_list_1[3])
	x_list_3.append(x_list_2[3])

	y_list_3.append(y_list_1[3])
	y_list_3.append(y_list_2[3])

	draw_line(x_list_3, y_list_3)

	x_list_4.append(x_list_1[4])
	x_list_4.append(x_list_2[5])

	y_list_4.append(y_list_1[4])
	y_list_4.append(y_list_2[5])

	point_cad_thanh_ho_ga = Point_cad_thanh_ho_ga(x_list_4, y_list_4)

	return point_cad_thanh_ho_ga

def draw_thanh_ho_ga(hoga, point_cad_thanh_ho_ga):
# point 1
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] - (hoga.h_thanh + hoga.h_day)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 2
	p_x_1 = point_cad_thanh_ho_ga.x[-1] + (2*hoga.t + hoga.b_hoga)
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 3
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] + (hoga.h_thanh + hoga.h_day - hoga.h_tam_dan_2)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 4
	p_x_1 = point_cad_thanh_ho_ga.x[-1] - hoga.t
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 5
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] - (hoga.h_thanh - hoga.h_tam_dan_2)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 6
	p_x_1 = point_cad_thanh_ho_ga.x[-1] - hoga.b_hoga
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 7
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] + hoga.h_thanh
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

	x_list_1 = []
	y_list_1 = []

	x_list_2 = []
	y_list_2 = []

	for i in range(len(point_cad_thanh_ho_ga.x)):
		if i == 0:
			continue
		else:
			x_list_1.append(point_cad_thanh_ho_ga.x[i])
			y_list_1.append(point_cad_thanh_ho_ga.y[i])

	draw_line(x_list_1, y_list_1)

# vẽ tấm đan

# point 1
	x_list_2.append(x_list_1[3])
	y_list_2.append(y_list_1[3])

# point 2
	x_list_2.append(x_list_2[-1])
	y_list_2.append(y_list_2[-1] + hoga.h_tam_dan_2)	

# point 3
	x_list_2.append(x_list_2[-1] - (hoga.b_hoga + hoga.t - hoga.b_co))
	y_list_2.append(y_list_2[-1])

# point 4
	x_list_2.append(x_list_2[-1])
	y_list_2.append(y_list_2[-1] - hoga.h_tam_dan_2)

# point 1
	x_list_2.append(x_list_2[0])
	y_list_2.append(y_list_2[0])

	draw_line(x_list_2, y_list_2)

# pygame!!!!!!

pygame.init()
screen = pygame.display.set_mode((500,600))
pygame.display.set_caption("Vẽ hố ga by pdyhung")
clock = pygame.time.Clock()
running = True

pass_program = TextButton("Pass: ", (50,25))

h_co_pygame = TextButton("Chiều cao cổ: ", (50,50))
b_co_pygame = TextButton("Bề rộng lòng trong cổ: ", (50,75))
t_pygame = TextButton("Chiều dày thành: ", (50,100))
h_tam_dan_1_pygame = TextButton("Chiều cao tấm đan 1: ", (50,125))
b_tam_dan_1_pygame = TextButton("Bề rộng tấm đan 1: ", (50,150))
h_thanh_pygame = TextButton("Chiều cao bụng: ", (50,175))
b_hoga_pygame = TextButton("Bề rộng bụng: ", (50,200))
h_day_pygame = TextButton("Chiều dày đáy: ", (50,225))
h_tam_dan_2_pygame = TextButton("Chiều cao tấm đan 2: ", (50,250))
i_md_pygame = TextButton("Độ dốc mặt đường: ", (50,275))

draw_hoga_pygame = TextButton("Vẽ hố ga!", (225,525))

# background_image = pygame.image.load("trang1.jpg")
# background_image = pygame.transform.scale(background_image,(500,600))

user_text_pass = ""

user_text = ["350","1000","200","80","1200","2000","1500","200","150","0"]

active = []
for i in range(11):
	active.append(False) 

nhap_so = []
for i in range(10):
	nhap_so.append(i+1)

while running:
	clock.tick(60)
	screen.fill((0,0,0))
	# screen.blit(background_image, (0,0))

	h_co_pygame.draw()
	b_co_pygame.draw()
	t_pygame.draw()
	h_tam_dan_1_pygame.draw()
	b_tam_dan_1_pygame.draw()
	h_thanh_pygame.draw()
	b_hoga_pygame.draw()
	h_day_pygame.draw()
	h_tam_dan_2_pygame.draw()
	i_md_pygame.draw()

	draw_hoga_pygame.draw()

	pass_program.draw()


	for event in pygame.event.get():

		if event.type == pygame.MOUSEBUTTONDOWN:
			if event.button == 1:
				if pass_program.is_mouse_on_text() == True:
					active[-1] = True
				else:
					active[-1] = False		

		if event.type == pygame.KEYDOWN:
			if active[-1] == True:
				if event.key == pygame.K_BACKSPACE:
					user_text_pass = user_text_pass[0:-1]
				else:
					user_text_pass += event.unicode


		if event.type == pygame.MOUSEBUTTONDOWN:
			if event.button == 1:

				if user_text_pass == "1":

					if h_co_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 0:
								active[i] = True
							else:
								active[i] = False

					if b_co_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 1:
								active[i] = True
							else:
								active[i] = False

					if t_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 2:
								active[i] = True
							else:
								active[i] = False

					if h_tam_dan_1_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 3:
								active[i] = True
							else:
								active[i] = False									

					if b_tam_dan_1_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 4:
								active[i] = True
							else:
								active[i] = False

					if h_thanh_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 5:
								active[i] = True
							else:
								active[i] = False

					if b_hoga_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 6:
								active[i] = True
							else:
								active[i] = False

					if h_day_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 7:
								active[i] = True
							else:
								active[i] = False

					if h_tam_dan_2_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 8:
								active[i] = True
							else:
								active[i] = False

					if i_md_pygame.is_mouse_on_text() == True:
						for i in range(len(active)):
							if i == 9:
								active[i] = True
							else:
								active[i] = False

					if draw_hoga_pygame.is_mouse_on_text() == True:
						point_cad = add_a_point_cad()
						hoga = hoga_input(user_text)
						point_cad_thanh_ho_ga = draw_co_ho_ga(hoga, point_cad)
						draw_thanh_ho_ga(hoga, point_cad_thanh_ho_ga)

		if event.type == pygame.KEYDOWN:

			for i in range(10):
				if active[i] == True:
					if event.key == pygame.K_BACKSPACE:
						user_text[i] = user_text[i][0:-1]
					else:
						user_text[i] += event.unicode


		if event.type == pygame.QUIT:
			running = False

	for i in range(10):
		nhap_so[i] = TextButton(user_text[i], (250, 50 + i*25))
		nhap_so[i].draw()

	pass_in_put = TextButton(user_text_pass, (250,25))
	pass_in_put.draw()

	writer = TextButton("Wrote by Hung Pham in 1995", (250,575))
	writer.draw()

	pygame.display.flip()

pygame.quit()

print("complete! ")