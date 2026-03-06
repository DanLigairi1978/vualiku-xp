import xml.etree.ElementTree as ET
import os

def extract_text(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Namespaces
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    texts = []
    for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
        p_text = []
        for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
            if run.text:
                p_text.append(run.text)
        if p_text:
            texts.append("".join(p_text))
    return "\n".join(texts)

if __name__ == "__main__":
    xml_file = r"c:\Users\danli\Documents\Vualiku XP\docs\extracted_docx\word\document.xml"
    output_file = r"c:\Users\danli\Documents\Vualiku XP\docs\mega_prompt_text.txt"
    try:
        content = extract_text(xml_file)
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Text extracted successfully to {output_file}")
    except Exception as e:
        print(f"Error: {e}")
