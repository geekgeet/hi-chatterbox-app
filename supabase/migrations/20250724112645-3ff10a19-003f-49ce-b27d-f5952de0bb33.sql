-- Fix remaining function by setting search_path
ALTER FUNCTION public.has_role(_user_id UUID, _role app_role) SET search_path = '';