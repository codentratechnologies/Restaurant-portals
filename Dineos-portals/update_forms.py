import os
import re

directories_to_scan = [
    r"d:\Codentra\Restaurant-portals\Dineos-portals\src\admin-pages",
    r"d:\Codentra\Restaurant-portals\Dineos-portals\src\restaurant-pages"
]

files_to_update = []
for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if (file.startswith("Create") or file.startswith("Update")) and file.endswith(".tsx"):
                files_to_update.append(os.path.join(root, file))

for file_path in files_to_update:
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    print(f"Updating {os.path.basename(file_path)}")
    
    # Cancel Button
    # Match: <button type="button" className="..."> ... Cancel ... </button>
    content = re.sub(
        r'<button type="button" className="[^"]*">(\s*Cancel\s*)</button>',
        r'<button type="button" className="px-6 py-2.5 rounded-xl font-bold text-[#1a1f36] bg-white border border-[#E8ECF4] hover:bg-[#F4F6FA] transition-all">\1</button>',
        content
    )
    
    # Save Button
    # Match: <Button ... className="..."> ... Save ... </Button>
    # We want to replace the className of the Button that has 'Save' in it.
    # A bit tricky with regex. Let's do it by finding <Button ...> ... Save ... </Button>
    # Actually, we can just replace the className inside the Button tag if it's the Save button.
    # The Save button usually looks like: <Button ... className="gap-2 px-8 shadow-sm">
    # Let's use a regex to find `<Button` followed by some attributes, a `className="..."`, more attributes, `>`, and then `Save` inside its children.
    
    def replace_save_btn(match):
        attrs = match.group(1)
        inner = match.group(2)
        # remove existing className
        attrs = re.sub(r'className="[^"]*"', '', attrs)
        # add the new className
        new_attrs = f'className="gap-2 px-6 shadow-sm bg-[#FF6B00] text-white hover:bg-[#E66000] border-0" {attrs.strip()}'
        return f'<Button {new_attrs}>{inner}</Button>'

    # Regex explanation:
    # <Button([^>]+)>(.*?Save.*?)</Button>
    content = re.sub(r'<Button([^>]+)>((?:.|\n)*?Save(?:.|\n)*?)</Button>', replace_save_btn, content)
    
    # Footer Container
    # Replace the container classes to match the branch style
    # "p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl"
    # To "p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl"
    content = content.replace(
        'className="p-8 border-t border-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl"',
        'className="p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl"'
    )
    content = content.replace(
        'className="p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-gray-50 rounded-b-xl"',
        'className="p-8 border-t border-[#E8ECF4] flex items-center justify-end gap-3 bg-[#F8FAFC] rounded-b-2xl"'
    )

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done updating all forms.")
