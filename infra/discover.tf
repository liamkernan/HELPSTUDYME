data "digitalocean_droplets" "existing" {}
data "digitalocean_domains" "existing" {}

output "existing_droplets" {
  value = data.digitalocean_droplets.existing.droplets
}

output "existing_domains" {
  value = data.digitalocean_domains.existing.domains
}