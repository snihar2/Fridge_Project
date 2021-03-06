<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\FridgeRepository")
 */
class Fridge
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $type;

    /**
     * @ORM\Column(type="integer")
     */
    private $nbr_floors;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Floor", mappedBy="id_fridge", orphanRemoval=true)
     */
    private $fridge;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="list_fridges")
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $image_fridge_path;


    public function __construct()
    {
        $this->fridge = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getNbrFloors(): ?int
    {
        return $this->nbr_floors;
    }

    public function setNbrFloors(int $nbr_floors): self
    {
        $this->nbr_floors = $nbr_floors;

        return $this;
    }

    /**
     * @return Collection|Floor[]
     */
    public function getFridge(): Collection
    {
        return $this->fridge;
    }

    public function addFridge(Floor $fridge): self
    {
        if (!$this->fridge->contains($fridge)) {
            $this->fridge[] = $fridge;
            $fridge->setIdFridge($this);
        }

        return $this;
    }

    public function removeFridge(Floor $fridge): self
    {
        if ($this->fridge->contains($fridge)) {
            $this->fridge->removeElement($fridge);
            // set the owning side to null (unless already changed)
            if ($fridge->getIdFridge() === $this) {
                $fridge->setIdFridge(null);
            }
        }

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getImageFridgePath(): ?string
    {
        return $this->image_fridge_path;
    }

    public function setImageFridgePath(string $image_fridge_path): self
    {
        $this->image_fridge_path = $image_fridge_path;

        return $this;
    }
}
