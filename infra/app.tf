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