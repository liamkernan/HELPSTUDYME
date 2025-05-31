terraform {
  cloud {
    organization = "helpstudyme"
    workspaces {
      name = "HELPSTUDYME"
    }
  }
  
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

variable "do_token" {}
variable "pvt_key" {}
variable "openai_api_key" {}
variable "firebase_api_key" {}
variable "firebase_auth_domain" {}
variable "firebase_project_id" {}
variable "firebase_storage_bucket" {}
variable "firebase_messaging_sender_id" {}
variable "firebase_app_id" {}

provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "helpstudyme" {
  name = "helpstudyme"
}