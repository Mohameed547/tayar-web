"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, AlertTriangle, Camera, User, Lock, MapPin, RefreshCw, X, Shield } from "lucide-react";
import { getShipmentById } from "@/features/shipments/api";
import { updateOrderStatus, verifyOTP } from "@/features/shipments/api/captain-api";
import type { Shipment } from "@/features/shipments/types";

export default function DeliveryVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Steps state
  const [step, setStep] = useState(1);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsDistance, setGpsDistance] = useState<number | null>(null);
  const [captainCoords, setCaptainCoords] = useState<{ lat: number; lng: number } | null>(null);

  // OTP state
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Photo state
  const [packageImage, setPackageImage] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Recipient / Signature state
  const [recipientName, setRecipientName] = useState("");
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [finalSubmitLoading, setFinalSubmitLoading] = useState(false);
  const [finalSuccess, setFinalSuccess] = useState(false);
  const [finalError, setFinalError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    getShipmentById(id)
      .then((data) => {
        setShipment(data);
        if (data.proofOfDelivery?.recipientName) {
          setRecipientName(data.proofOfDelivery.recipientName);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load shipment details.");
        setLoading(false);
      });
  }, [id]);

  // Geolocation calculation helper (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  const handleGPSVerify = () => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCaptainCoords({ lat, lng });

        if (shipment?.deliveryCoords && shipment.deliveryCoords.length >= 2) {
          const destLng = shipment.deliveryCoords[0];
          const destLat = shipment.deliveryCoords[1];
          const dist = calculateDistance(lat, lng, destLat, destLng);
          setGpsDistance(Math.round(dist));

          if (dist <= 200) {
            setGpsVerified(true);
            setTimeout(() => setStep(2), 1200);
          } else {
            setGpsError(`You are currently ${Math.round(dist)}m away from the destination. You must be within 200m to verify.`);
          }
        } else {
          setGpsError("Shipment delivery coordinates are missing in system.");
        }
        setGpsLoading(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        setGpsError("Failed to capture GPS location. Please check your browser permissions.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimulateGPS = () => {
    if (shipment?.deliveryCoords && shipment.deliveryCoords.length >= 2) {
      const destLng = shipment.deliveryCoords[0];
      const destLat = shipment.deliveryCoords[1];
      setCaptainCoords({ lat: destLat, lng: destLng });
      setGpsDistance(0);
      setGpsVerified(true);
      setGpsError(null);
      setTimeout(() => setStep(2), 1200);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length < 6) {
      setOtpError("Please enter a valid 6-digit OTP code.");
      return;
    }
    setOtpLoading(true);
    setOtpError(null);

    try {
      await verifyOTP(id, otpCode);
      setOtpVerified(true);
      setTimeout(() => setStep(3), 1200);
    } catch (err: any) {
      console.error(err);
      setOtpError(err.response?.data?.message || "Invalid OTP code or verification failed.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPackageImage(reader.result as string);
        setPhotoError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProceedFromPhoto = () => {
    if (!packageImage) {
      setPhotoError("Package photo is required to complete delivery.");
      return;
    }
    setStep(4);
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#ffffff";

    const coords = getEventCoords(e);
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getEventCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage(null);
  };

  const getEventCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleFinalSubmit = async () => {
    if (!recipientName) {
      setFinalError("Recipient name is required.");
      return;
    }

    setFinalSubmitLoading(true);
    setFinalError(null);

    const canvas = canvasRef.current;
    let signatureBase64: string | undefined = undefined;
    if (canvas) {
      const blank = document.createElement("canvas");
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() !== blank.toDataURL()) {
        signatureBase64 = canvas.toDataURL();
      }
    }

    try {
      await updateOrderStatus(id, {
        status: "delivered" as any,
        otpCode,
        recipientName,
        signatureImage: signatureBase64,
        packageImage: packageImage || undefined,
        lat: captainCoords?.lat,
        lng: captainCoords?.lng,
      });

      setFinalSuccess(true);
      setTimeout(() => {
        router.push("/captain-dashboard");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setFinalError(err.response?.data?.message || "Failed to complete delivery submission.");
      setFinalSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-t-blue-500 border-slate-800 animate-spin" />
          <span className="text-sm font-semibold">Loading verification details...</span>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400 gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <span>{error || "Shipment not found"}</span>
        <button
          onClick={() => router.push("/captain-dashboard")}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (finalSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce">
            <Check className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Delivery Completed!</h2>
            <p className="text-slate-400 text-xs mt-2">
              GPS, OTP, and Package photo verified. Funds have been successfully released to your wallet.
            </p>
          </div>
          <div className="w-full bg-slate-950/80 border border-slate-850 p-4 rounded-xl text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Tracking Code:</span>
              <span className="font-semibold">{shipment.trackingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Recipient Name:</span>
              <span className="font-semibold">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Distance Checked:</span>
              <span className="font-semibold text-emerald-400">{gpsDistance}m (Limit: 200m)</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-t-transparent border-slate-500 animate-spin" />
            Redirecting to dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-850 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/captain-dashboard")}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-200">Verify Delivery</h1>
            <p className="text-[10px] text-slate-500">{shipment.trackingNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-850 px-3 py-1 rounded-full text-[10px] text-slate-400">
          <Shield className="h-3 w-3 text-blue-500" />
          Secured Delivery verification
        </div>
      </header>

      {/* Progress Timeline Header */}
      <div className="bg-slate-900 border-b border-slate-850 py-4 px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs font-semibold">
          {[
            { num: 1, label: "GPS Check", done: gpsVerified },
            { num: 2, label: "OTP Code", done: otpVerified },
            { num: 3, label: "Photo", done: !!packageImage },
            { num: 4, label: "Signature", done: false },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2">
              <div
                className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] transition-colors ${
                  step === item.num
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : item.done || step > item.num
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {item.done || step > item.num ? <Check className="h-3 w-3" /> : item.num}
              </div>
              <span
                className={`hidden sm:inline ${
                  step === item.num
                    ? "text-blue-400 font-bold"
                    : item.done || step > item.num
                    ? "text-emerald-400"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Step Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-6 flex flex-col justify-center">
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">GPS Proximity Verification</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We must confirm you are physically within 200 meters of the customer's delivery destination.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-semibold text-slate-300">{shipment.deliveryAddress.split(",")[0]}</span>
                </div>
                {gpsDistance !== null && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Calculated Distance:</span>
                    <span className={`font-bold ${gpsVerified ? "text-emerald-400" : "text-red-400"}`}>
                      {gpsDistance} meters {gpsVerified ? "(Valid)" : "(Too Far)"}
                    </span>
                  </div>
                )}
              </div>

              {gpsError && (
                <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{gpsError}</span>
                </div>
              )}

              {gpsVerified && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>GPS Proximity Verified successfully. Unlocking OTP step...</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleGPSVerify}
                disabled={gpsLoading || gpsVerified}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                {gpsLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Checking GPS Range...
                  </>
                ) : gpsVerified ? (
                  "Proximity Confirmed"
                ) : (
                  "Start GPS Check"
                )}
              </button>

              {!gpsVerified && (
                <button
                  type="button"
                  onClick={handleSimulateGPS}
                  className="w-full mt-2 bg-slate-850 hover:bg-slate-800 text-blue-400 font-bold py-2 rounded-xl text-[11px] transition-colors border border-slate-700 flex items-center justify-center gap-1.5"
                >
                  ⚡ محاكاة الوصول للموقع (تجريبي) / Simulate Arrival
                </button>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2">
                <Lock className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">OTP Verification Code</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter the 6-digit verification code provided by the recipient to authorize release of funds.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="XXXXXX"
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 text-center font-mono tracking-widest text-lg text-blue-400 placeholder-slate-700 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {otpError && (
                <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpVerified && (
                <div className="bg-emerald-950/40 border border-emerald-900/50 p-3 rounded-xl text-xs text-emerald-400 flex items-start gap-2.5">
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>OTP Verified! Proceeding to Photo Upload...</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otpLoading || otpCode.length < 6 || otpVerified}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                {otpLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Verifying OTP...
                  </>
                ) : otpVerified ? (
                  "Verified"
                ) : (
                  "Submit Verification Code"
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2">
                <Camera className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">Delivered Package Photo</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a clear photograph of the package at the customer's delivery location.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col items-center justify-center">
                {packageImage ? (
                  <div className="relative w-full h-56 bg-slate-950 border border-slate-850 rounded-xl overflow-hidden group">
                    <img src={packageImage} alt="Captured proof" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPackageImage(null)}
                      className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-44 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-950/40">
                    <Camera className="h-8 w-8 text-slate-600 group-hover:text-blue-400" />
                    <span className="text-xs text-slate-500">Capture / Upload Package Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {photoError && (
                <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{photoError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleProceedFromPhoto}
                disabled={!packageImage}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Continue to Signature
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 mb-2">
                <User className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-100 font-sans">Recipient & Signature</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fill in the recipient's name and request their digital signature on the screen below.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Recipient Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-500">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter recipient's name"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Digital Signature
                  </label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
                  >
                    Clear
                  </button>
                </div>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={120}
                    className="w-full h-[120px] bg-slate-950 border border-slate-850 rounded-xl cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={endDrawing}
                  />
                </div>
              </div>

              {finalError && (
                <div className="bg-red-950/40 border border-red-900/50 p-3 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{finalError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={finalSubmitLoading || !recipientName}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                {finalSubmitLoading ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Submitting Proof of Delivery...
                  </>
                ) : (
                  "Complete & Confirm Delivery"
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
