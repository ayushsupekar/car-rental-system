package com.ayush.car_rental_system.common.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    // Returns map with "url" and "public_id"
    public Map<String, String> upload(MultipartFile file, String folder) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "overwrite", false
                    )
            );
            return Map.of(
                    "url", result.get("secure_url").toString(),
                    "public_id", result.get("public_id").toString()
            );
        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new RuntimeException("Image upload failed. Please try again.");
        }
    }

    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            // Log but don't throw — DB record will still be deleted
            // A failed Cloudinary delete should not roll back the DB transaction
            log.error("Cloudinary delete failed for publicId {}: {}", publicId, e.getMessage());
        }
    }
}
