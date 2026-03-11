from PIL import Image
import numpy as np

def remove_detected_background(input_path, output_path, tolerance=30):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()
        
        # Detect background color from top-left pixel
        bg_color = datas[0]
        print(f"Detected background color: {bg_color}")
        
        newData = []
        for item in datas:
            # Check if pixel matches background color within tolerance
            if (abs(item[0] - bg_color[0]) < tolerance and
                abs(item[1] - bg_color[1]) < tolerance and
                abs(item[2] - bg_color[2]) < tolerance):
                newData.append((255, 255, 255, 0)) # Make transparent
            else:
                newData.append(item)
                
        img.putdata(newData)
        
        # Crop whitespace if needed (optional, keeps tight fit)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} to {output_path}")
        print(f"Original size: {img.size}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    remove_detected_background("logo.png", "public/logo_final.png")
