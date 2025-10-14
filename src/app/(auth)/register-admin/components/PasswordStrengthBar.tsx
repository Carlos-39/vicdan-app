
import React from "react";

type PasswordStrengthBarProps = {
  strength: number; // 0-4
  label: string;
  color: string;
};

const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ strength, label, color }) => {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        height: 8,
        width: "100%",
        background: "#eee",
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 4
      }}>
        <div
          style={{
            width: `${(strength / 4) * 100}%`,
            height: "100%",
            background: color,
            transition: "width 0.3s"
          }}
        />
      </div>
      <span style={{ fontSize: 12, color }}>{label}</span>
    </div>
  );
};

export default PasswordStrengthBar;
