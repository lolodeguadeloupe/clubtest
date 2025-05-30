import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCarRental } from "@/hooks/useCarRentals";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import BackButton from "@/components/common/BackButton";
import RentalDetailHeader from "@/components/car-rental/RentalDetailHeader";
import RentalDescription from "@/components/car-rental/RentalDescription";
import RentalModels from "@/components/car-rental/RentalModels";
import RentalReservationForm from "@/components/car-rental/RentalReservationForm";

const CarRentalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const carRentalId = id ? Number(id) : null;
  const { carRental, loading, error } = useCarRental(carRentalId);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-80 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !carRental) {
    return (
      <div className="container mx-auto px-4 py-8">
        <BackButton backTo="/location" />
        <div className="text-center mt-8">
          {error ? (
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erreur lors du chargement des détails de location.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-4">Location non trouvée</h2>
              <p className="text-gray-600 mb-4">
                La location que vous recherchez n'existe pas ou n'est plus disponible.
              </p>
            </>
          )}
          <Button onClick={() => navigate("/location")} className="mt-4">
            Retour aux locations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton backTo="/location" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images & Description */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Image */}
          <div className="rounded-lg overflow-hidden shadow-lg h-80">
            <img 
              src={carRental.image} 
              alt={carRental.name}
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Description */}
          <RentalDescription rental={carRental} />

          {/* Available Models */}
          <RentalModels 
            models={carRental.models} 
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>

        {/* Right column - Reservation Form */}
        <div>
          <RentalReservationForm 
            rentalName={carRental.name}
            selectedModel={selectedModel}
            models={carRental.models}
          />
        </div>
      </div>
    </div>
  );
};

export default CarRentalDetail;
