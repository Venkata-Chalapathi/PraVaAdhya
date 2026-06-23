import React from "react";

export const MenuItemSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between border-b border-gold/10 pb-8 animate-pulse">
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <div className="h-5 bg-charcoal/15 w-2/5" />
          <div className="h-[1px] flex-grow border-b border-dotted border-charcoal/15 mx-4" />
          <div className="h-5 bg-charcoal/15 w-1/12" />
        </div>
        <div className="h-4 bg-charcoal/15 w-4/5 mb-2" />
        <div className="h-4 bg-charcoal/15 w-3/5" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 animate-pulse">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="aspect-square border border-charcoal/10 p-4 flex flex-col justify-between bg-charcoal/5">
          <div className="h-4 bg-charcoal/10 w-1/3" />
          <div className="h-8 bg-charcoal/10 w-2/3 mx-auto" />
          <div className="h-4 bg-charcoal/10 w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const StatCardSkeleton: React.FC = () => {
  return (
    <div className="border border-charcoal/10 p-6 bg-charcoal/5 animate-pulse flex flex-col justify-between min-h-[120px]">
      <div className="h-4 bg-charcoal/10 w-1/2" />
      <div className="h-8 bg-charcoal/10 w-1/3 mt-4" />
    </div>
  );
};
