import cloudinary
import cloudinary.api
import os

# Configure Cloudinary with the provided credentials
cloudinary.config(
  cloud_name = "dgyvfx8zo",
  api_key = "916444487288489",
  api_secret = "_-vMiZ9qFbVOd9Wj_NBJwRe7YP0"
)

def create_upload_preset():
    preset_name = "dineos_uploads"
    print(f"Creating/updating unsigned upload preset: {preset_name}...")
    
    try:
        # Check if it already exists
        cloudinary.api.upload_preset(preset_name)
        print("Preset already exists. Updating it just in case...")
        cloudinary.api.update_upload_preset(
            preset_name,
            unsigned=True,
            folder="dineos_menu",
            allowed_formats=["jpg", "png", "jpeg", "webp"],
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
    except cloudinary.exceptions.NotFound:
        # Create it if it doesn't exist
        cloudinary.api.create_upload_preset(
            name=preset_name,
            unsigned=True,
            folder="dineos_menu",
            allowed_formats=["jpg", "png", "jpeg", "webp"],
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},
                {"quality": "auto", "fetch_format": "auto"}
            ]
        )
    
    print("✅ Upload preset configured successfully!")
    print(f"Preset Name: {preset_name}")

if __name__ == "__main__":
    create_upload_preset()
