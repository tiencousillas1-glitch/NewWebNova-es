from PIL import Image
import numpy as np

def remove_background(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        newData = []
        for item in datas:
            # Check if pixel is white-ish (R, G, B all > 255 - tolerance)
            if item[0] > 255 - tolerance and item[1] > 255 - tolerance and item[2] > 255 - tolerance:
                newData.append((255, 255, 255, 0)) # Make it transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} to {output_path}")
        print(f"Original size: {img.size}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_background("logo.png", "logo_restored.png")
