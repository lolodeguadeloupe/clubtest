
import { supabase } from "@/integrations/supabase/client";
import { UserFormData } from "./UserForm";

export const createUser = async (userData: UserFormData) => {
  console.log("Création d'utilisateur avec:", userData.email);
  
  // Créer l'utilisateur dans Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
      }
    }
  });
  
  if (authError) {
    throw authError;
  }
  
  if (!authData.user) {
    throw new Error("Échec de création de l'utilisateur");
  }
  
  console.log("Utilisateur créé avec succès:", authData.user);
  
  // Mettre à jour le profil avec les informations supplémentaires
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: userData.name,
      phone: userData.phone,
    })
    .eq('id', authData.user.id);
  
  if (profileError) {
    console.warn("Erreur lors de la mise à jour du profil:", profileError);
  }
  
  // Si l'utilisateur a une adresse, créer une entrée dans la table clients
  if (userData.address) {
    const { error: clientError } = await supabase
      .from('clients')
      .insert({
        id: authData.user.id,
        address: userData.address,
        phone: userData.phone,
      });
    
    if (clientError) {
      console.warn("Erreur lors de la création du client:", clientError);
    }
  }
  
  return authData.user;
};

// Modification de la fonction pour éviter la récursivité RLS
export const fetchUsers = async () => {
  try {
    console.log("Tentative de récupération des utilisateurs...");
    
    // Approche directe pour récupérer les profils en utilisant 
    // l'admin de l'application pour contourner les problèmes de RLS
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, created_at, updated_at, role')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Erreur lors de la récupération des profils:", error);
      throw error;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log("Aucun utilisateur trouvé");
      return [];
    }
    
    console.log(`${profiles.length} utilisateurs trouvés:`, profiles);
    
    // Transformer les données des profils au format requis
    const formattedUsers = profiles.map(profile => {
      // Convertir les dates au format souhaité
      const createdAt = new Date(profile.created_at);
      const formattedCreatedAt = createdAt.toISOString().split('T')[0];
      
      // Utiliser la dernière date de mise à jour comme dernière activité
      const lastActivity = new Date(profile.updated_at || profile.created_at);
      const formattedLastActivity = lastActivity.toISOString().split('T')[0];
      
      return {
        id: profile.id,
        name: profile.first_name || profile.email?.split('@')[0] || 'Utilisateur',
        email: profile.email || '',
        subscriptionStatus: "none" as "active" | "none" | "pending" | "expired",
        subscriptionType: "none" as "basic" | "premium" | "none",
        subscriptionEndDate: null,
        registrationDate: formattedCreatedAt,
        lastActivity: formattedLastActivity,
      };
    });
    
    return formattedUsers;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    throw error;
  }
};
