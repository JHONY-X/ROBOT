from rest_framework.throttling import SimpleRateThrottle


class Login_Throttle(SimpleRateThrottle):
    scope = "login"
    message = "Too many login attempts. Please try again later."

    def get_cache_key(self, request, view):
        ip = self.get_ident(request)
        return f"login-throttle-{ip}"