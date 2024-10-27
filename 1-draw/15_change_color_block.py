import math
import win32com.client
import pythoncom

# Setup AutoCAD connection
acad = win32com.client.Dispatch("AutoCAD.Application")
acad_Doc = acad.ActiveDocument
acadModel = acad_Doc.ModelSpace

def APoint(x, y, z=0):
	return win32com.client.VARIANT(pythoncom.VT_ARRAY | pythoncom.VT_R8, (x, y, z))

def cad_select_object():
	try:
		acad_Doc.SelectionSets.Item("SS1").Delete()
	except Exception as e:
		print(f"Delete selection failed: {e}")
	ssetObj = acad_Doc.SelectionSets.Add("SS1")
	ssetObj.SelectOnScreen()
	return ssetObj
import win32com.client

def export_block_names():
	block_names = []
	block_table = acad_Doc.Blocks
	for block in block_table:
		# Get the name of the block
		block_names.append(block.Name)
	print("Block names in the current drawing:")
	for name in block_names:
		print(name)
	return block_names

# def set_color_to_byblock_in_blocks():
# 	block_table = acad_Doc.Blocks
# 	for block in block_table:
# 		print(f"Processing block: {block.Name}")
# 		for entity in block:
# 			try:
# 				entity.Color = 0
# 				print(f"Set color of entity {entity.EntityName} in block {block.Name} to ByBlock")
# 			except Exception as e:
# 				print(f"Could not set color for entity {entity.EntityName} in block {block.Name}: {e}")
# 	acad_Doc.Regen()

def set_color_to_byblock_in_blocks():
	block_table = acad_Doc.Blocks
	for block in block_table:
		if block.Name.startswith("*"):
			continue
		print(f"Processing block: {block.Name}")
		for entity in block:
			try:
				entity.Color = 0
				print(f"Set color of entity {entity.EntityName} in block {block.Name} to ByBlock")
			except Exception as e:
				print(f"Could not set color for entity {entity.EntityName} in block {block.Name}: {e}")
	acad_Doc.Regen(1)

def change_color_of_model_space_objects(color_index=251):

	for entity in acadModel:
		try:
			entity.Color = color_index
			print(f"Set color of entity {entity.EntityName} to color index {color_index}")
		except Exception as e:
			print(f"Could not set color for entity {entity.EntityName}: {e}")
	doc.Regen(1)

def show_menu():
	print("......")
	print("WROTE BY PHẠM VĂN HƯNG IN 2024 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
	print("option 1: set color to block")
	print("option 2: set color to object")
	print("option 4: --> EXIT <--")
	print("......")

def main():
	while True:
		show_menu()
		choice = input("Select an option (1-2): ")
		if choice == "1":
			set_color_to_byblock_in_blocks()
		elif choice == "2":
			change_color_of_model_space_objects(251)
		else:
			break

main()
print("complete!")