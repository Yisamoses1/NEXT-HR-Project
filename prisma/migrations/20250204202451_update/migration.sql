/*
  Warnings:

  - You are about to drop the column `clock_in_time` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `clock_out_time` on the `Attendance` table. All the data in the column will be lost.
  - You are about to drop the column `mfa_secret` on the `MFA` table. All the data in the column will be lost.
  - Added the required column `clockInTime` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clockOutTime` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mfaSecret` to the `MFA` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" DROP COLUMN "clock_in_time",
DROP COLUMN "clock_out_time",
ADD COLUMN     "clockInTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "clockOutTime" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "MFA" DROP COLUMN "mfa_secret",
ADD COLUMN     "mfaSecret" TEXT NOT NULL;
