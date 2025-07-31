import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Compass, Sparkles, Calendar, User, Crown } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { User as UserEntity } from "@/entities/User";

const navigationItems = [
  {
    title: "Discover",
    url: createPageUrl("Discover"),
    icon: Compass,
    description: "Explore community adventures"
  },
  {
    title: "Create",
    url: createPageUrl("Create"),
    icon: Sparkles,
    description: "Generate your perfect adventure"
  },
  {
    title: "Plans",
    url: createPageUrl("Plans"),
    icon: Calendar,
    description: "Your saved adventures"
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
    description: "Account & preferences"
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await UserEntity.me();
      setUser(userData);
    } catch (error) {
      console.log("User not authenticated");
    }
  };

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --sage: #3c7660;
            --gold: #f2cc6c;
            --cream: #f8f2d5;
            --teal: #4d987b;
            --sage-light: #4d987b;
            --sage-dark: #2d5a46;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full bg-white">
        <Sidebar className="border-r-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <SidebarHeader className="p-6 border-b border-gold/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" 
                   style={{ background: 'linear-gradient(135deg, var(--sage), var(--teal))' }}>
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl tracking-tight" style={{ color: 'var(--sage-dark)' }}>Motion</h2>
                <p className="text-xs tracking-wide opacity-70" style={{ color: 'var(--sage)' }}>Discover life in motion</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4 bg-white/90">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`h-14 rounded-2xl transition-all duration-300 group hover:shadow-md border ${
                          location.pathname === item.url 
                            ? 'shadow-md border-gold/40 bg-white/80' 
                            : 'hover:bg-white/60 border-transparent hover:border-gold/30'
                        }`}
                        style={{
                          backgroundColor: location.pathname === item.url ? 'rgba(255,255,255,0.8)' : 'transparent',
                          color: location.pathname === item.url ? 'var(--sage-dark)' : 'var(--sage)'
                        }}
                      >
                        <Link to={item.url} className="flex items-center gap-4 px-4 py-3 w-full">
                          <div className={`p-2 rounded-xl transition-all duration-300 ${
                            location.pathname === item.url 
                              ? 'shadow-sm' 
                              : 'group-hover:bg-white/50'
                          }`}
                          style={{
                            backgroundColor: location.pathname === item.url ? 'var(--sage)' : 'transparent'
                          }}>
                            <item.icon className={`w-4 h-4 transition-colors duration-300 ${
                              location.pathname === item.url ? 'text-white' : 'text-current'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold text-sm block">{item.title}</span>
                            <span className="text-xs opacity-70 block">{item.description}</span>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user && (
              <SidebarGroup className="mt-8">
                <SidebarGroupLabel className="text-xs font-semibold tracking-wider uppercase px-4 mb-3" style={{ color: 'var(--sage)' }}>
                  Your Plan
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-3 rounded-2xl bg-white/80 border border-gold/30 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <Crown className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                      <Badge 
                        className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ 
                          backgroundColor: user.subscription_tier === 'premium' ? 'var(--gold)' : 'var(--sage-light)', 
                          color: 'white' 
                        }}
                      >
                        {user.subscription_tier === 'premium' ? 'Motion+' : 'Free'}
                      </Badge>
                    </div>
                    <div className="text-xs mb-2" style={{ color: 'var(--sage-dark)' }}>
                      <strong>Adventures this month:</strong> {user.adventures_used_this_month || 0}
                      {user.subscription_tier === 'free' && '/3'}
                    </div>
                    {user.subscription_tier === 'free' && (
                      <Link to={createPageUrl("Profile")} 
                            className="text-xs font-medium underline transition-colors duration-200"
                            style={{ color: 'var(--sage)' }}>
                        Upgrade to Motion+ →
                      </Link>
                    )}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          {user && (
            <SidebarFooter className="border-t border-gold/20 p-4 bg-white/90">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm" 
                     style={{ backgroundColor: 'var(--sage-light)' }}>
                  <span className="text-white font-semibold text-sm">
                    {user.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--sage-dark)' }}>
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs truncate opacity-70" style={{ color: 'var(--sage)' }}>
                    {user.location || 'Set your location'}
                  </p>
                </div>
              </div>
            </SidebarFooter>
          )}
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/90 backdrop-blur-sm border-b border-gold/20 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg transition-colors duration-200" 
                               style={{ color: 'var(--sage)' }} />
              <h1 className="text-xl font-bold" style={{ color: 'var(--sage-dark)' }}>Motion</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-white">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}