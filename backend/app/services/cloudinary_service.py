import cloudinary
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status
from app.config import settings

# Configure Cloudinary with your credentials from .env
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 5


async def upload_product_image(file: UploadFile, product_id: str) -> dict:
    """
    Uploads image to Cloudinary.
    Returns dict with url and public_id.
    """
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: JPEG, PNG, WEBP",
        )

    # Read file content
    contents = await file.read()

    # Validate file size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_SIZE_MB}MB",
        )

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="jewel_inventory/products",
            public_id=f"product_{product_id}",
            overwrite=True,           # replaces existing image for same product
            resource_type="image",
            transformation=[
                {"width": 800, "height": 800, "crop": "limit"},  # max 800x800
                {"quality": "auto"},                               # auto compress
                {"fetch_format": "auto"},                          # auto format
            ],
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image upload failed: {str(e)}",
        )


async def delete_product_image(public_id: str) -> None:
    """Deletes image from Cloudinary when product is deleted."""
    try:
        cloudinary.uploader.destroy(public_id)
    except Exception:
        pass  # Don't fail if image deletion fails