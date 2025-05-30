
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { createRestaurantReservation } from "@/services/restaurantService";

export interface ReservationFormData {
  date: Date | undefined;
  time: string;
  guests: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface UseRestaurantReservationProps {
  restaurantId: number;
  restaurantName: string;
  restaurantLocation?: string;
  onClose?: () => void;
}

export const useRestaurantReservation = ({
  restaurantId, 
  restaurantName,
  restaurantLocation = "",
  onClose
}: UseRestaurantReservationProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ReservationFormData>({
    date: undefined,
    time: "",
    guests: "2",
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const updateField = <K extends keyof ReservationFormData>(key: K, value: ReservationFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // Automatically go to next step when selecting a time in step 2
    if (key === 'time' && step === 2) {
      nextStep();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!formData.date || !formData.time || !formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createRestaurantReservation({
        restaurant_id: restaurantId,
        reservation_date: formData.date.toISOString(),
        reservation_time: formData.time,
        guests: parseInt(formData.guests),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || undefined
      }, restaurantName, restaurantLocation);

      // Message spécifique selon le résultat de l'email
      let emailMessage = "";
      if (!result.emailSuccess) {
        // Vérifier si c'est une erreur de mode test (email adresse non autorisée)
        if (result.emailMessage && result.emailMessage.includes("test")) {
          emailMessage = " En mode test, nous ne pouvons envoyer des emails qu'au propriétaire du compte Resend. Votre réservation est bien enregistrée.";
        } else {
          emailMessage = " " + result.emailMessage;
        }
      } else {
        emailMessage = " Un email de confirmation a été envoyé.";
      }

      // Notification de réservation
      toast({
        title: "Réservation confirmée !",
        description: `Votre table pour ${formData.guests} personne(s) au ${restaurantName} est réservée le ${format(formData.date, 'dd/MM/yyyy')} à ${formData.time}.${emailMessage}`,
      });
      
      // Reset form
      setFormData({
        date: undefined,
        time: "",
        guests: "2",
        name: "",
        email: "",
        phone: "",
        notes: ""
      });
      setStep(1);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erreur lors de la création de la réservation:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la réservation. Veuillez réessayer plus tard.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.date) {
      toast({
        title: "Date manquante",
        description: "Veuillez sélectionner une date",
        variant: "destructive"
      });
      return;
    }
    
    // Remove validation for step 2 since we automatically advance when selecting a time
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return {
    formData,
    updateField,
    isSubmitting,
    step,
    handleSubmit,
    nextStep,
    prevStep
  };
};
