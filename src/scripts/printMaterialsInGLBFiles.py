import bpy
import os
import re
import sys

# Add this dictionary at the beginning of your script, after the imports
glb_materials = {}
all_materials = set()  # New set to store all unique materials
all_item_types = set()
all_collections = set()
all_skus = set()  # New set to store all unique SKUs
mismatched_names = []  # New list to store mismatched file names and SKUs

def clean_material_name(name):
    # Remove the period and numbers at the end of the material name
    return re.sub(r'\.\d+$', '', name)

def get_custom_property(obj, property_name):
    custom_data = obj.get('custom_properties')
    if custom_data:
        return custom_data.get(property_name)
    return None

def process_file(file_path):
    try:
        # Clear existing objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        # Import GLB
        bpy.ops.import_scene.gltf(filepath=file_path)

        # Get the filename without extension
        file_name = os.path.splitext(os.path.basename(file_path))[0]

        # Initialize an empty set for unique materials in this file
        unique_materials = set()
        has_high_poly = False
        has_low_poly = False
        item_type = None
        collection_name = None
        sku = None

        print(f"\nProcessing file: {file_name}")
        for obj in bpy.data.objects:
            print(f"Object: {obj.name}, Type: {obj.type}")
            if obj.type == 'MESH':
                if obj.name == 'highPolyMesh':
                    has_high_poly = True
                elif obj.name == 'lowPolyMesh':
                    has_low_poly = True
                
                for slot in obj.material_slots:
                    if slot.material:
                        # Clean the material name before adding it to the set
                        clean_name = clean_material_name(slot.material.name)
                        unique_materials.add(clean_name)
                        all_materials.add(clean_name)  # Add to the global set
            
            elif obj.type == 'EMPTY':
                if obj.name.startswith('collection:'):
                    collection_name = obj.name.split(':', 1)[1]
                    all_collections.add(collection_name)
                elif obj.name.startswith('itemType:'):
                    item_type = obj.name.split(':', 1)[1]
                    all_item_types.add(item_type)
                else:
                    # Assume this is the root empty with the SKU as its name
                    sku = obj.name
                    all_skus.add(sku)
                    
                    # Check if the file name matches the SKU
                    if file_name != sku:
                        mismatched_names.append((file_name, sku))

        # Add the unique materials to the glb_materials dictionary
        glb_materials[file_name] = {
            'materials': list(unique_materials),
            'has_high_poly': has_high_poly,
            'has_low_poly': has_low_poly,
            'item_type': item_type,
            'collection': collection_name,
            'sku': sku
        }

        # ... rest of your existing code ...

    except Exception as e:
        print(f"Error processing file {file_path}: {str(e)}")

def main():
    # Check if the script is run with arguments
    if len(sys.argv) > 4:  # sys.argv[0] is the script name, sys.argv[1:4] are default Blender arguments
        glb_directory = sys.argv[4]
        
        # Iterate through all files in the specified directory
        for file in os.listdir(glb_directory):
            if file.lower().endswith('.glb'):
                file_path = os.path.join(glb_directory, file)
                process_file(file_path)
    else:
        print("Please provide the directory path as an argument when running the script.")

    # Print the dictionary of GLB files and their materials
    print("\nGLB Files and Their Information:")
    for glb_file, info in glb_materials.items():
        print(f"{glb_file}:")
        print(f"  SKU: {info['sku']}")
        print(f"  Item Type: {info['item_type']}")
        print(f"  Collection: {info['collection']}")
        print(f"  Has highPolyMesh: {info['has_high_poly']}")
        print(f"  Has lowPolyMesh: {info['has_low_poly']}")
        print("  Materials:")
        for material in sorted(info['materials']):
            print(f"    - {material}")
        print()

    # Print the set of all unique materials
    print("\nAll Unique Materials Encountered:")
    for material in sorted(all_materials):
        print(f"- {material}")

    # Print the set of all unique item types
    print("\nAll Unique Item Types:")
    for item_type in sorted(all_item_types):
        print(f"- {item_type}")

    # Print the set of all unique collections
    print("\nAll Unique Collections:")
    for collection in sorted(all_collections):
        print(f"- {collection}")

    # Print the set of all unique SKUs
    print("\nAll Unique SKUs:")
    for sku in sorted(all_skus):
        print(f"- {sku}")

    # Print files with mismatched names and SKUs
    print("\nFiles with mismatched names and SKUs:")
    for file_name, sku in mismatched_names:
        print(f"File: {file_name}.glb, SKU: {sku}")

    print(f"\nTotal mismatched files: {len(mismatched_names)}")

    # Add this line to prevent Blender from quitting immediately
    input("Press Enter to exit...")

if __name__ == "__main__":
    main()

# blender --background --python /path/to/glb_material_scanner.py -- /path/to/glb/files/directory