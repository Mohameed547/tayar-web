"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileSchema } from "@/lib/validations";
import { User, Phone, Mail, Calendar, CheckCircle } from "lucide-react";
import { mockCustomer } from "@/constants/mock-data";
import { cn } from "@/lib/utils";

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"info" | "edit">("info");
  const [successMessage, setSuccessMessage] = useState("");

  // Hook Form setup with Zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: mockCustomer.name,
      email: mockCustomer.email,
      phone: mockCustomer.phone,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    // Mock profile update delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Update local mock values
        mockCustomer.name = data.name;
        mockCustomer.email = data.email;
        mockCustomer.phone = data.phone;

        setSuccessMessage("Profile updated successfully!");
        setActiveTab("info");
        resolve();

        // Clear success message after 4s
        setTimeout(() => setSuccessMessage(""), 4000);
      }, 1000);
    });
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-100 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold tracking-tight">My Profile</h1>

      {successMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-4 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center text-center gap-4 shadow-sm">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-blue-600 text-white font-extrabold text-2xl border-4 border-zinc-800">
            {mockCustomer.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-zinc-200">{mockCustomer.name}</span>
            <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">
              {mockCustomer.role}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Verified Account
          </span>
        </div>

        {/* Right Column: Tab View */}
        <div className="md:col-span-8 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Tab Selector Headers */}
          <div className="flex border-b border-zinc-800 bg-zinc-950/40">
            <button
              onClick={() => setActiveTab("info")}
              className={cn(
                "flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none",
                activeTab === "info"
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={cn(
                "flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 focus:outline-none",
                activeTab === "edit"
                  ? "border-blue-500 text-blue-500 bg-zinc-900/50"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              )}
            >
              Edit Profile
            </button>
          </div>

          {/* Tab Content body */}
          <div className="p-6">
            {activeTab === "info" ? (
              <div className="flex flex-col gap-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Account Details
                </h2>

                <div className="flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">Full Name</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{mockCustomer.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">Email Address</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{mockCustomer.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">Phone Number</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">{mockCustomer.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-zinc-500 font-medium">Joined On</span>
                      <span className="text-zinc-200 font-semibold mt-0.5">January 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                  Update Information
                </h2>

                {/* Name Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-xs text-zinc-250 focus:outline-none transition-colors",
                      errors.name ? "border-red-500 focus:border-red-500" : "border-zinc-850 focus:border-zinc-700"
                    )}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <span className="text-[10px] text-red-400 font-medium mt-0.5">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Email Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register("email")}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-xs text-zinc-250 focus:outline-none transition-colors",
                      errors.email ? "border-red-500 focus:border-red-500" : "border-zinc-850 focus:border-zinc-700"
                    )}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <span className="text-[10px] text-red-400 font-medium mt-0.5">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Phone Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-zinc-400">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    {...register("phone")}
                    className={cn(
                      "w-full bg-zinc-950 border rounded-lg px-4 py-2.5 text-xs text-zinc-250 focus:outline-none transition-colors",
                      errors.phone ? "border-red-500 focus:border-red-500" : "border-zinc-850 focus:border-zinc-700"
                    )}
                    placeholder="01012345678"
                  />
                  {errors.phone && (
                    <span className="text-[10px] text-red-400 font-medium mt-0.5">
                      {errors.phone.message}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all shadow-md focus:outline-none mt-2"
                >
                  {isSubmitting ? "Saving changes..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
