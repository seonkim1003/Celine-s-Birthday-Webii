# Copy images from Cursor assets to this folder (run from project root or assets folder)
$src = "C:\Users\super\.cursor\projects\c-Users-super-OneDrive-Desktop-Celiene-s-bday\assets"
$dst = $PSScriptRoot
$prefix = "c__Users_super_AppData_Roaming_Cursor_User_workspaceStorage_2b5812122bff0e57b82ecae62361194b_images_image-"
$copies = @(
    @{ From = "${prefix}a6cd4355-70a4-4b1f-91f0-ad3a8a15cdef.png"; To = "portrait.png" },
    @{ From = "${prefix}9e26b0d8-37a2-407f-bc11-03c40d2237fe.png"; To = "scene1.png" },
    @{ From = "${prefix}f8f3758a-4453-40e6-9cf3-e3a1a838fa39.png"; To = "scene2.png" },
    @{ From = "${prefix}013bff71-0fbc-42b6-aa69-7c97e3c1f14d.png"; To = "scene3.png" },
    @{ From = "${prefix}3dffdf29-0a65-4b28-b445-2b6763160e19.png"; To = "gallery1.png" },
    @{ From = "${prefix}e654759e-70e2-45c0-a1e3-1b333cb61aa8.png"; To = "gallery2.png" },
    @{ From = "${prefix}bf199027-7eaf-4d06-b50a-24b8a3fca9e6.png"; To = "gallery3.png" },
    @{ From = "${prefix}c4280d24-9b3e-435f-8fea-3af079152c75.png"; To = "gallery4.png" },
    @{ From = "${prefix}b702c283-07c3-4ec7-bfd6-9e12ce6048e5.png"; To = "gallery5.png" },
    @{ From = "${prefix}f520d201-3ddb-42d1-b69f-0eb90ac05d18.png"; To = "gallery6.png" },
    @{ From = "${prefix}ba7f5d70-21b3-4072-a361-be687d8be611.png"; To = "gallery7.png" },
    @{ From = "${prefix}864a2530-10dc-45bc-bf89-a9af872f6bdb.png"; To = "gallery8.png" }
)
foreach ($c in $copies) {
    $fromPath = Join-Path $src $c.From
    $toPath = Join-Path $dst $c.To
    if (Test-Path $fromPath) {
        Copy-Item $fromPath $toPath -Force
        Write-Host "Copied $($c.To)"
    } else {
        Write-Warning "Source not found: $($c.From)"
    }
}
