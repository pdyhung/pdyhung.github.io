from pyautocad import Autocad, APoint, aDouble

a = Autocad(create_if_not_exists = True, visible = False)


def cad_select_dim():
	with open("data_dim.csv", mode="w") as file:
		# d = 0
		e = ""
		b = a.get_selection()
		for i in b:
			c = i.Measurement
			e = e + "+" + str(round(c,2))
			# d = d + c
			# i.TextOverride = "Pham Van Hung <> + " + str(round(c,2))
		file.write(e)

def cad_select_hatch():
	with open("data_hatch.csv", mode="w") as file:
		e = ""
		b = a.get_selection()
		for i in b:
			c = i.Area
			e = e + "+" + str(round(c,2))
			d = i.Centroid
			d = str(d).strip("(").strip(")")
			file.write(d + "\n")
			d = d.split(",")
			a.model.AddText(str(round(c,2)), APoint(float(d[0]),float(d[1])),2)
		file.write(e)


def main():
	# cad_select_dim()
	cad_select_hatch()


main()

print("complete! ")