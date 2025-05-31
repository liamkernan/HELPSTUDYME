resource "digitalocean_app" "helpstudyme" {
  spec {
    name     = "helpstudyme"
    region   = "nyc"
    domains  = ["helpstudy.me"]
    features = ["buildpack-stack=ubuntu-22"]
    
    # backend service
    service {
      name               = "helpstudyme-backend"
      instance_count     = 1
      instance_size_slug = "apps-s-1vcpu-0.5gb"
      http_port          = 8080
      dockerfile_path    = "backend/Dockerfile"
      source_dir         = "backend"
      
      env {
        key   = "OPENAI_API_KEY"
        value = var.openai_api_key
        type  = "SECRET"
      }
      
      github {
        repo           = "liamkernan/HELPSTUDYME"
        branch         = "main"
        deploy_on_push = true
      }
    }
    
    # frontend static site
    static_site {
      name              = "helpstudy-me"
      build_command     = "npm install && npm run build"
      environment_slug  = "node-js"
      output_dir        = "build"
      source_dir        = "frontend/ap-question-generator"
      error_document    = "index.html"
      
      env {
        key   = "REACT_APP_FIREBASE_API_KEY"
        value = var.firebase_api_key
      }
      env {
        key   = "REACT_APP_FIREBASE_AUTH_DOMAIN"
        value = var.firebase_auth_domain
      }
      env {
        key   = "REACT_APP_FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }
      env {
        key   = "REACT_APP_FIREBASE_STORAGE_BUCKET"
        value = var.firebase_storage_bucket
      }
      env {
        key   = "REACT_APP_FIREBASE_MESSAGING_SENDER_ID"
        value = var.firebase_messaging_sender_id
      }
      env {
        key   = "REACT_APP_FIREBASE_APP_ID"
        value = var.firebase_app_id
      }
      env {
        key   = "REACT_APP_API_BASE"
        value = "https://helpstudy.me/api"
      }
      
      github {
        repo           = "liamkernan/HELPSTUDY.ME"
        branch         = "main"
        deploy_on_push = true
      }
    }
    
    # ingress rules
    ingress {
      rule {
        match {
          path {
            prefix = "/"
          }
        }
        component {
          name = "helpstudy-me"
        }
      }
      
      rule {
        match {
          path {
            prefix = "/api"
          }
        }
        component {
          name                 = "helpstudyme-backend"
          preserve_path_prefix = true
        }
      }
    }
    
    # alerts
    alert {
      rule     = "DOMAIN_FAILED"
      disabled = false
    }
    
    alert {
      rule     = "DEPLOYMENT_FAILED"
      disabled = true
    }
  }
}