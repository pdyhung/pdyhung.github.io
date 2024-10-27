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

def cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter):
    toa_do_list = []
    ac_dim = []

    for i in cad_block:
        if i.ObjectName == "AcDbBlockReference":
            toa_do_list.append([i.InsertionPoint[0], i.InsertionPoint[1]])

    if dim_verter == "y":
        toa_do_list.sort(key=lambda l: l[1])
    else:
        toa_do_list.sort(key=lambda m: m[0])

    for i in range(len(toa_do_list) - 1):
        start_point = APoint(toa_do_list[i][0], toa_do_list[i][1])
        end_point = APoint(toa_do_list[i + 1][0], toa_do_list[i + 1][1])
        ac_line = acadModel.AddLine(start_point, end_point)
        alpha = ac_line.Angle + math.pi / 2 + dim_Angle
        ac_line.delete()

        text_dim_pos_x = toa_do_list[i][0] + math.cos(alpha) * dim_distance
        text_dim_pos_y = toa_do_list[i][1] + math.sin(alpha) * dim_distance

        ac_dim.append(acadModel.AddDimAligned(start_point, end_point, APoint(text_dim_pos_x, text_dim_pos_y)))

    return ac_dim

def cad_add_text_select_block(text_distance, text_Angle, cad_block, text_verter, text_pre_name, text_pre_num):
    toa_do_list = []
    ac_text = []

    for i in cad_block:
        if i.ObjectName == "AcDbBlockReference":
            toa_do_list.append([i.InsertionPoint[0], i.InsertionPoint[1]])

    if text_verter == "y":
        toa_do_list.sort(key=lambda l: l[1])
    else:
        toa_do_list.sort(key=lambda m: m[0])

    for i in range(len(toa_do_list) - 1):
        start_point = APoint(toa_do_list[i][0], toa_do_list[i][1])
        end_point = APoint(toa_do_list[i + 1][0], toa_do_list[i + 1][1])
        ac_line = acadModel.AddLine(start_point, end_point)
        alpha = ac_line.Angle + math.pi / 2 + text_Angle
        text_angle1 = ac_line.Angle
        ac_line.delete()

        text_dim_pos_x = toa_do_list[i][0] + math.cos(alpha) * text_distance
        text_dim_pos_y = toa_do_list[i][1] + math.sin(alpha) * text_distance

        new_text = acadModel.AddText(text_pre_name + str(i + int(text_pre_num)), APoint(text_dim_pos_x, text_dim_pos_y), 2)
        new_text.Rotate(APoint(text_dim_pos_x, text_dim_pos_y), text_angle1)
        # Set alignment point and justification
        new_text.Alignment = 1  # Center alignment constant
        new_text.TextAlignmentPoint = APoint(text_dim_pos_x, text_dim_pos_y)
        ac_text.append(new_text)

    text_dim_pos_x = toa_do_list[-1][0] + math.cos(alpha) * text_distance
    text_dim_pos_y = toa_do_list[-1][1] + math.sin(alpha) * text_distance

    final_text = acadModel.AddText(text_pre_name + str(len(toa_do_list) - 1 + int(text_pre_num)), APoint(text_dim_pos_x, text_dim_pos_y), 2)
    final_text.Rotate(APoint(text_dim_pos_x, text_dim_pos_y), text_angle1)
    # Set alignment point and justification
    final_text.Alignment = 1  # Center alignment constant
    final_text.TextAlignmentPoint = APoint(text_dim_pos_x, text_dim_pos_y)
    ac_text.append(final_text)

    return ac_text

def show_menu():
    print("......")
    print("WROTE BY PHẠM VĂN HƯNG IN 2024 ___CA ĐOÀN GIÁO XỨ VŨNG TÀU___ S2")
    print("option 1: Dim block")
    print("option 2: Add text block")
    print("option 3: Draw polyline base point block")
    print("option 4: --> EXIT <--")
    print("......")

def main():
    while True:
        show_menu()
        choice = input("Select an option (1-2): ")
        if choice == "1":
            print("Select block: ")
            cad_block = cad_select_object()
            dim_verter = input("Filter Block by direction (x or y): ")
            dim_Angle = 0
            dim_distance = float(input("Enter distance from block to dim text: "))
            ac_dim = cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter)
            dim_check = input("Rotate dim? (y/n): ")
            if dim_check == "y":
                for dim in ac_dim:
                    dim.delete()
                dim_Angle = math.pi
                cad_dim_select_block(dim_distance, dim_Angle, cad_block, dim_verter)
        elif choice == "2":
            print("Select block: ")
            cad_block = cad_select_object()
            text_verter = input("Filter Block by direction (x or y): ")
            text_Angle = 0
            text_distance = float(input("Enter distance from block to dim text: "))
            text_pre_name = input("Enter text prefix: ")
            text_pre_num = input("Enter starting number: ")
            ac_text = cad_add_text_select_block(text_distance, text_Angle, cad_block, text_verter, text_pre_name, text_pre_num)
            text_check = input("Rotate text? (y/n): ")
            if text_check == "y":
                for text in ac_text:
                    text.delete()
                text_Angle = math.pi
                cad_add_text_select_block(text_distance, text_Angle, cad_block, text_verter, text_pre_name, text_pre_num)
        else:
            break

main()
print("complete!")