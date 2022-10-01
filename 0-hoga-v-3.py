from pyautocad import Autocad, APoint, aDouble

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

def draw_line(x_list, y_list):
	x = x_list
	y = y_list
	for j in range(len(x)-1):
		a.model.AddLine(APoint(x[j],y[j]) ,APoint(x[j+1],y[j+1]))

# def hoga_input():
# 	h_co = float(input("Nhập chiều cao cổ hố ga: "))
# 	b_co = float(input("Nhập chiều rộng cổ hố ga: "))
# 	t = float(input("Nhập chiều dày thành hố ga: "))
# 	h_tam_dan_1 = float(input("Nhập chiều dày tấm đan 1: "))
# 	b_tam_dan_1 = float(input("Nhập chiều rộng tấm đan 1: "))
# 	h_thanh = float(input("Nhập chiều cao thành hố ga: "))
# 	b_hoga = float(input("Nhập chiều rộng hố ga: "))
# 	h_day = float(input("Nhập chiều dày đáy hố ga: "))
# 	h_tam_dan_2 = float(input("Nhập chiều dày tấm đan 2: "))

# 	hoga = Hoga(h_co, b_co, t, h_tam_dan_1 ,b_tam_dan_1 ,h_thanh , b_hoga, h_day, h_tam_dan_2)


# 	return hoga

def hoga_input():
	h_co = 350
	b_co = 1000
	t = 250
	h_tam_dan_1 = 80
	b_tam_dan_1 = 1200
	h_thanh = 2000
	b_hoga = 1500
	h_day = 250
	h_tam_dan_2 = 150
	i_md = -1.45

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
	b = a.get_selection()
	for i in b:
		toa_do = i.Coordinates
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

def main():
	point_cad = add_a_point_cad()
	hoga = hoga_input()
	point_cad_thanh_ho_ga = draw_co_ho_ga(hoga, point_cad)
	draw_thanh_ho_ga(hoga, point_cad_thanh_ho_ga)

main()

print("complete! ")