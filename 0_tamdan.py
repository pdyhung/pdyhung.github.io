from pyautocad import Autocad, APoint, aDouble

a = Autocad(create_if_not_exists = True, visible = False)

class Tamdan:
	def __init__(self, w, h, t, ax, ay):
		self.w = w
		self.h = h
		self.t = t
		self.ax = ax
		self.ay = ay

class Point_cad:
	def __init__(self, x, y):
		self.x = x
		self.y = y

def draw_line(x_list, y_list):
	x = x_list
	y = y_list
	for j in range(len(x)-1):
		a.model.AddLine(APoint(x[j],y[j]) ,APoint(x[j+1],y[j+1]))

def tamdan_input():
	w = 2200
	h = 1400
	t = 50
	ax = 200
	ay = 150

	tamdan = Tamdan(w, h, t, ax ,ay)

	return tamdan

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
	b = a.get_selection()
	for i in b:
		toa_do = i.Coordinates
		toa_do = str(toa_do).strip("(").strip(")")
		toa_do_list = toa_do.split(",")
		point_cad_x.append(toa_do_list[0])
		point_cad_y.append(toa_do_list[1])
	point_cad = Point_cad(point_cad_x, point_cad_y)
	return point_cad

def draw_duong_bao(tamdan, point_cad):
# point 2
	p_x = float(point_cad.x[0]) + tamdan.w
	p_y = float(point_cad.y[0])
	p_append(point_cad ,p_x, p_y)

# point 3
	p_x = float(point_cad.x[-1])
	p_y = float(point_cad.y[-1]) - tamdan.h
	p_append(point_cad ,p_x, p_y)

# point 4
	p_x = float(point_cad.x[-1]) - tamdan.w
	p_y = float(point_cad.y[-1])
	p_append(point_cad ,p_x, p_y)

	p_append(point_cad ,float(point_cad.x[0]), float(point_cad.y[0]))

	x_list_1 = []
	y_list_1 = []

	x_list_2 = []
	y_list_2 = []

	x_list_3 = []
	y_list_3 = []

	x_list_31 = []
	y_list_31 = []

	for i in range(len(point_cad.x)):
		x_list_1.append(float(point_cad.x[i]))
		y_list_1.append(float(point_cad.y[i]))
	draw_line(x_list_1, y_list_1)

# ve thep

# point 5
	p_x = float(point_cad.x[0]) + tamdan.t
	p_y = float(point_cad.y[0]) - tamdan.t
	p_append(point_cad ,p_x, p_y)

# point 6
	p_x = float(point_cad.x[1]) - tamdan.t
	p_y = float(point_cad.y[1]) - tamdan.t
	p_append(point_cad ,p_x, p_y)

# point 7
	p_x = float(point_cad.x[2]) - tamdan.t
	p_y = float(point_cad.y[2]) + tamdan.t
	p_append(point_cad ,p_x, p_y)

# point 8
	p_x = float(point_cad.x[3]) + tamdan.t
	p_y = float(point_cad.y[3]) + tamdan.t
	p_append(point_cad ,p_x, p_y)
	p_append(point_cad ,float(point_cad.x[5]), float(point_cad.y[5]))

	# for i in range(len(point_cad.x)-5,len(point_cad.x)):
	# 	x_list_2.append(float(point_cad.x[i]))
	# 	y_list_2.append(float(point_cad.y[i]))
	# draw_line(x_list_2, y_list_2)

	ax_phan_nguyen = (tamdan.w - 2*tamdan.t) // tamdan.ax
	ax_phan_du = (tamdan.w - 2*tamdan.t) % tamdan.ax

	for i in range(ax_phan_nguyen+1):
		p_x_1 = float(point_cad.x[5]) + tamdan.ax*(i)
		p_y_1 = float(point_cad.y[5]) 
		p_append(point_cad , p_x, p_y)
		p_x_2 = float(point_cad.x[5]) + tamdan.ax*(i)
		p_y_2 = float(point_cad.y[5]) - (tamdan.h - 2*tamdan.t)
		p_append(point_cad , p_x, p_y)
		a.model.AddLine(APoint(p_x_1,p_y_1) ,APoint(p_x_2,p_y_2))	

	ay_phan_nguyen = (tamdan.h - 2*tamdan.t) // tamdan.ay
	ay_phan_du = (tamdan.h - 2*tamdan.t) % tamdan.ay

	for i in range(ay_phan_nguyen+1):
		p_x_1 = float(point_cad.x[5])
		p_y_1 = float(point_cad.y[5]) - tamdan.ay*(i)
		p_append(point_cad , p_x, p_y)
		p_x_2 = float(point_cad.x[5]) + (tamdan.w - 2*tamdan.t)
		p_y_2 = float(point_cad.y[5]) - tamdan.ay*(i)  
		p_append(point_cad , p_x, p_y)
		a.model.AddLine(APoint(p_x_1,p_y_1) ,APoint(p_x_2,p_y_2))	


	# for i in range(len(point_cad.x) - 2*ax_phan_nguyen, len(point_cad.x)):
	# 	x_list_3.append(float(point_cad.x[i]))
	# 	y_list_3.append(float(point_cad.y[i]))

	# for i in range(len(x_list_3)):
	# 	draw_line(x_list_3[i], y_list_3[i])	

	# x_list_3.append(x_list_1[3])
	# x_list_3.append(x_list_2[3])

	# y_list_3.append(y_list_1[3])
	# y_list_3.append(y_list_2[3])

	# draw_line(x_list_3, y_list_3)

	# x_list_4.append(x_list_1[4])
	# x_list_4.append(x_list_2[5])

	# y_list_4.append(y_list_1[4])
	# y_list_4.append(y_list_2[5])

	# point_cad_thanh_ho_ga = Point_cad_thanh_ho_ga(x_list_4, y_list_4)

	# return point_cad_thanh_ho_ga

def draw_thanh_ho_ga(tamdan, point_cad_thanh_ho_ga):
# point 1
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] - (tamdan.h_thanh + tamdan.h_day)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 2
	p_x_1 = point_cad_thanh_ho_ga.x[-1] + (2*tamdan.t + tamdan.b_tamdan)
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 3
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] + (tamdan.h_thanh + tamdan.h_day - tamdan.h_tam_dan_2)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 4
	p_x_1 = point_cad_thanh_ho_ga.x[-1] - tamdan.t
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 5
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] - (tamdan.h_thanh - tamdan.h_tam_dan_2)
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 6
	p_x_1 = point_cad_thanh_ho_ga.x[-1] - tamdan.b_tamdan
	p_y_1 = point_cad_thanh_ho_ga.y[-1]
	p_append_1(point_cad_thanh_ho_ga ,p_x_1, p_y_1)

# point 7
	p_x_1 = point_cad_thanh_ho_ga.x[-1]
	p_y_1 = point_cad_thanh_ho_ga.y[-1] + tamdan.h_thanh
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
	y_list_2.append(y_list_2[-1] + tamdan.h_tam_dan_2)	

# point 3
	x_list_2.append(x_list_2[-1] - (tamdan.b_tamdan + tamdan.t - tamdan.b_co))
	y_list_2.append(y_list_2[-1])

# point 4
	x_list_2.append(x_list_2[-1])
	y_list_2.append(y_list_2[-1] - tamdan.h_tam_dan_2)

# point 1
	x_list_2.append(x_list_2[0])
	y_list_2.append(y_list_2[0])

	draw_line(x_list_2, y_list_2)

def main():
	point_cad = add_a_point_cad()
	tamdan = tamdan_input()
	draw_duong_bao(tamdan, point_cad)
	# point_cad_thanh_ho_ga = draw_duong_bao(tamdan, point_cad)
	# draw_thanh_ho_ga(tamdan, point_cad_thanh_ho_ga)

main()

print("complete! ")